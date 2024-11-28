import { RequestStatus } from "~/types";
import { IUpdateRequest } from "../application/request";

export async function update(ctx: any, input: IUpdateRequest): Promise<void> {
  await ctx.db.request.update({
    where: { id: input.requestId },
    data: { 
      status: RequestStatus.Approved,
      updatedById: input.approverId.toString(),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      effectDate: true,
      description: true,
      minutes: true,
      creator: {
        select: {
          name: true,
        },
      }
    },
  });
}

export async function rejectRequest(ctx, input) {
  const request = await ctx.db.request.update({
    where: { id: input },
    data: { status: RequestStatus.Rejected },
    select: {
      id: true,
      effectDate: true,
      description: true,
      minutes: true,
      creator: {
        select: {
          name: true,
        },
      },
      approver: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  return {
    id: request.id,
    workerName: request.creator.name,
    effectDate: request.effectDate,
    description: request.description,
    minutes: request.minutes,
    approver: request.approver.name,
    approverId: Number(request.approver.id),
    status: RequestStatus.Rejected,
  };
}
