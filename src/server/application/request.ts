import { InferredApproveSchema } from "../zodTypes/request";
import { update } from "../repository/request";
import { NodeTypes, WorkflowStatus } from "../api/constants/enums";
import type { Request, User, WorkflowRequest } from '@prisma/client';
import { RequestStatus } from "~/types";

interface IRequestData {
    requestId: number;
    rol: string;
    userId: number;
    isApproving: boolean;
}

export async function Approve(ctx: any, input: InferredApproveSchema): Promise<void> {
    const userSession = getUserSession(ctx.session.user);
    const requestData: IRequestData = {
        requestId: input.requestId,
        rol: userSession.rol,
        userId: userSession.id,
        isApproving: input.isApproving
    }
    const getNextStatus = await GetNextStatus(ctx, requestData);
    const updateData = {
        requestId: input.requestId,
        approverId: userSession.id,
        newStatus: getNextStatus,
    }
    await update(ctx, updateData);
}

interface RequestAndWorkflow extends Request {
    WorkflowRequest: WorkflowRequest | null;
}

async function GetNextStatus(ctx: any, input: IRequestData): Promise<number> {
    const { requestId, rol, userId, isApproving } = input;
    const request: RequestAndWorkflow = await getRequestById(ctx, requestId);
    const requestWorkflow = request.WorkflowRequest;
    if (!requestWorkflow) {
        throw new Error("Workflow not found");
    }
    const wf: Graph = JSON.parse(requestWorkflow.json as string);
    const nodes = wf.nodes;
    let currentNode = await getNodeFromWf(requestWorkflow.currentNodeId, nodes);
    let state = RequestStatus.Pending;

    while (currentNode) {
        switch (currentNode.type) {
            case NodeTypes.END:
                await updateWorkflowStatus(ctx, requestId, WorkflowStatus.FINISHED);
                return state;
            case NodeTypes.VALIDATION:
                const condition = currentNode.data.expression;
                const taskMinutes = request.minutes;
                const conditionResult = evaluateCondition(condition, NodeTypes.VALIDATION, taskMinutes);
                currentNode = getNextNode(currentNode.id, wf, conditionResult);
                break;

            case NodeTypes.APPROVER:
                const approverRole = rol as string;
                const roleCondition = currentNode.data.expression;
                const isAllowedRole = evaluateCondition(roleCondition, NodeTypes.APPROVER, approverRole);
                const isUserInValues = currentNode.data.values.includes(parseInt(request.createdById));
                currentNode = getNextNode(currentNode.id, wf, isAllowedRole && isUserInValues);
                break;

            case NodeTypes.STATE:
                state = currentNode.data.values[0] as number;
                currentNode = getNextNode(currentNode.id, wf, isApproving);
                break;

            default:
                throw new Error("Unknown node type");
        }
    }
    
    return state;
}

async function getRequestById(ctx: any, requestId: number): Promise<RequestAndWorkflow> {
    const request = await ctx.db.request.findUnique({
        where: { id: requestId },
        include: { WorkflowRequest: true },
    }) as RequestAndWorkflow | null;

    if (!request) throw new Error("Request not found");
    return request;
}

function getUserSession(user: User): Omit<User, "id"> & { id: number } {
    const userId = parseInt(user.id);
    if (isNaN(userId)) throw new Error("User not found");
    return {
        ...user,
        id: userId,
    }
}

function evaluateCondition(condition: string, nodeType: NodeTypes, value: unknown): boolean {
    switch (nodeType) {
        case NodeTypes.VALIDATION:
            return eval(condition.replace("minutes", value as string));
        case NodeTypes.APPROVER:
            return eval(condition.replace("approverRole", value as string));
        default:
            throw new Error("Unsupported node type for condition evaluation");
    }
}

function getNextNode(currentNodeId: number, wf: Graph, path?: boolean): Node {
    const edges: Edge[] = wf.edges.filter(edge => edge.source === currentNodeId);
    if (edges.length === 0) throw new Error("Edge not found");

    if (typeof path === "boolean") {
        const edge = edges.find(edge => edge.path === path);
        if (!edge) throw new Error("Edge not found");
        return getNodeFromWf(edge.target, wf.nodes);
    }
    
    if (!edges[0]) throw new Error("Edge not found");
    return getNodeFromWf(edges[0].target, wf.nodes);
}

async function updateWorkflowStatus(ctx: any, requestId: number, status: WorkflowStatus) {
    await ctx.db.workflowRequest.update({
        where: { requestId },
        data: { status },
    });
}

function getNodeFromWf(nodeId: number, nodes: Node[]): Node {
    const node = nodes.find(node => node.id === nodeId);
    if (!node) throw new Error("Node not found");
    return node;
}

interface BaseNode {
    id: number;
    type: number;
}

interface Type1Node extends BaseNode {
    type: 1;
    data: {
        values: any[];
        expression: string;
    };
}

interface Type2Node extends BaseNode {
    type: 2;
    data: {
        values: number[];
    };
}

interface Type3Node extends BaseNode {
    type: 3;
    data: {
        expression: string;
    };
}

interface Type4Node extends BaseNode {
    type: 4;
    data: {
        values: any[];
    };
}

type Node = Type1Node | Type2Node | Type3Node | Type4Node;

interface Edge {
    source: number;
    target: number;
    path?: boolean;
}

interface Graph {
    nodes: Node[];
    edges: Edge[];
}