import { InferredApproveSchema } from "../zodTypes/request";
import { update } from "../repository/request";
import { NodeTypes, RequestStatus, WorkflowStatus } from "../api/constants/enums";
import type { Request, User, WorkflowRequest } from '@prisma/client';

interface IRequestData {
    requestId: number;
    rol: number;
    userId: number;
    isApproving: boolean;
    request: RequestAndWorkflow;
}

export interface IUpdateRequest {
    requestId: number;
    approverId: number;
    newStatus: number;
    nextApproverId: number;
}

export async function Approve(ctx: any, input: InferredApproveSchema): Promise<void> {
    const userSession = await getUserSession(ctx, ctx.session.user);
    const request: RequestAndWorkflow = await getRequestById(ctx, input.requestId);
    const requestData: IRequestData = {
        requestId: input.requestId,
        rol: userSession.rol,
        userId: userSession.id,
        isApproving: input.isApproving,
        request,
    }

    const { state, currentNodeId } = await GetNextStatus(ctx, requestData);
    console.log('state ', state);
    const isTerminated = state === RequestStatus.REJECTED || state === RequestStatus.APPROVED;

    let nextApproverId = 0;
    if (!isTerminated) {
        nextApproverId = GetNexApproverId(ctx, {
            currentNodeId,
            state,
            request,
        });
    }
    
    await updateWorkflowStatus(ctx, {
        requestId: input.requestId,
        status: isTerminated ? WorkflowStatus.FINISHED : WorkflowStatus.PROCESSING,
        nextApproverId,
        currentNodeId,
        userSessionId: userSession.id.toString(),
    });

    const updateData: IUpdateRequest = {
        requestId: input.requestId,
        approverId: userSession.id,
        newStatus: state,
        nextApproverId,
    }
    await update(ctx, updateData);
}

interface RequestAndWorkflow extends Request {
    WorkflowRequest: WorkflowRequest | null;
}

async function GetNextStatus(ctx: any, input: IRequestData): Promise<{ currentNodeId: number, state: number }> {
    const { requestId, rol, userId, isApproving, request } = input;

    const requestWorkflow = request.WorkflowRequest;
    if (!requestWorkflow) {
        throw new Error("Workflow not found");
    }
    const wf: Graph = requestWorkflow.json as unknown as Graph;
    if (typeof wf !== "object" || wf === null) {
        throw new Error("Workflow JSON is null");
    }
    const nodes = wf.nodes;
    let currentNode: Node = await getNodeFromWf(requestWorkflow.currentNodeId, nodes);
    let state = RequestStatus.PENDING;
    let passesThroughApprover = 0;

    while (currentNode) {
        switch (currentNode.type) {
            case NodeTypes.END:
                return {
                    currentNodeId: currentNode.id,
                    state,
                };
            case NodeTypes.VALIDATION:
                const condition = currentNode.data.expression;
                const taskMinutes = request.minutes;
                const conditionResult = evaluateCondition(condition, NodeTypes.VALIDATION, taskMinutes);
                currentNode = getNextNode(currentNode.id, wf, conditionResult);
                break;

            case NodeTypes.APPROVER:
                if (passesThroughApprover > 0) {
                    return {
                        currentNodeId: currentNode.id,
                        state,
                    };
                }
                const approverRole = rol;
                const roleCondition = currentNode.data.expression;
                const isAllowedRole = evaluateCondition(roleCondition, NodeTypes.APPROVER, approverRole);
                const isUserInValues = currentNode.data.values.includes(userId);

                console.log('isAllowedRole ', isAllowedRole);
                console.log('isUserInValues ', currentNode.data.values, userId);
                console.log('approverRole ', approverRole, 'userId ', userId);

                const isAllowed = isAllowedRole && isUserInValues;
                if (!isAllowed) {
                    throw new Error("User not allowed to approve");
                }

                currentNode = getNextNode(currentNode.id, wf, isAllowed && isApproving);
                passesThroughApprover++;
                break;

            case NodeTypes.STATE:
                console.log('state ', currentNode.data.values[0]);
                state = currentNode.data.values[0] as number;
                currentNode = getNextNode(currentNode.id, wf, undefined);
                break;

            default:
                throw new Error("Unknown node type");
        }
    }

    if (!currentNode) {
        throw new Error("Current node is null or undefined");
    }
    return {
        currentNodeId: (currentNode as Node).id,
        state,
    }
}

async function getRequestById(ctx: any, requestId: number): Promise<RequestAndWorkflow> {
    const request = await ctx.db.request.findUnique({
        where: { id: requestId },
        include: { WorkflowRequest: true },
    }) as RequestAndWorkflow | null;

    if (!request) throw new Error("Request not found");
    return request;
}

async function getUserSession(ctx: any, user: User): Promise<Omit<User, "id"> & { id: number }> {
    const userId = parseInt(user.id);
    const userSession: User = await ctx.db.user.findUnique({
        where: { id: user.id },
    });
    if (!userSession) throw new Error("User not found");

    return {
        ...userSession,
        id: userId,
    };
}

function evaluateCondition(condition: string, nodeType: NodeTypes, value: unknown): boolean {
    switch (nodeType) {
        case NodeTypes.VALIDATION:
            return eval(condition.replace("minutes", value as string));
        case NodeTypes.APPROVER:
            return eval(condition.replace("approverRole", (value as number).toString()));
        default:
            throw new Error("Unsupported node type for condition evaluation");
    }
}

function getNextNode(currentNodeId: number, wf: Graph, path?: boolean): Node {
    const edges: Edge[] = wf.edges.filter(edge => edge.source === currentNodeId);
    if (edges.length === 0) throw new Error("Edge not found");

    console.log('currentNodeId ', currentNodeId);

    if (typeof path === "boolean") {
        const edge = edges.find(edge => edge.path === path);
        if (!edge) throw new Error("Edge not found");
        return getNodeFromWf(edge.target, wf.nodes);
    }

    if (!edges[0]) throw new Error("Edge not found");
    return getNodeFromWf(edges[0].target, wf.nodes);
}

async function updateWorkflowStatus(ctx: any, { requestId, status, nextApproverId, currentNodeId, userSessionId }: { requestId: number, status: WorkflowStatus, nextApproverId: number, currentNodeId: number, userSessionId: string }): Promise<void> {
    await ctx.db.workflowRequest.update({
        where: { requestId },
        data: { 
            status,
            nextApproverId: status === WorkflowStatus.PROCESSING ? nextApproverId.toString() : null,
            updatedById: userSessionId,
            updatedAt: new Date(),
            currentNodeId,
        },
    });
}

function getNodeFromWf(nodeId: number, nodes: Node[]): Node {
    const node = nodes.find(node => node.id === nodeId);
    if (!node) throw new Error("Node not found");
    return node;
}

function GetNexApproverId(ctx: any, input: { currentNodeId: number, state: number, request: RequestAndWorkflow }): number {
    const { request } = input;
    const requestWorkflow = request.WorkflowRequest;
    if (!requestWorkflow) {
        throw new Error("Workflow not found");
    }
    const wf: Graph = requestWorkflow.json as unknown as Graph;
    if (typeof wf !== "object" || wf === null) {
        throw new Error("Workflow JSON is null");
    }

    const nodes = wf.nodes;
    console.log('node id ', input.currentNodeId);
    console.log('nodes ', JSON.stringify(nodes, null, 2));
    const approverNode = nodes.find(node => node.id >= input.currentNodeId && node.type === NodeTypes.APPROVER) as Type1Node | undefined;
    if (!approverNode) throw new Error("Next approver node not found");

    return approverNode.data.values[0] as number;
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