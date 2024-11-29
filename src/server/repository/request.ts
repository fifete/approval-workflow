import { IUpdateRequest } from "../application/request";

export async function update(ctx: any, input: IUpdateRequest): Promise<void> {
  console.log('inside update state ', input.newStatus);

  await ctx.db.request.update({
    where: { id: input.requestId },
    data: { 
      status: input.newStatus,
      updatedById: input.approverId.toString(),
      updatedAt: new Date(),
    },
  });
}
