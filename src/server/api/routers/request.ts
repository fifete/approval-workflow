import { z } from "zod";
import { Request, RequestStatus } from "~/types";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.request.findMany({
      where: { OR: [
        { approverId: ctx.session.user.id },
        { createdById: ctx.session.user.id },
      ] },
      select: {
        id: true,
        effectDate: true,
        description: true,
        minutes: true,
        status: true,
        creator: {
            select: {
                name: true,
            },
        },
        approver: {
          select: {
            name: true,
          },
        },
      },
    });

    return requests.map(request => ({
      id: request.id,
      workerName: request.creator.name,
      effectDate: request.effectDate.toISOString(),
      description: request.description,
      minutes: request.minutes,
      approver: request.approver.name,
      status: request.status === RequestStatus.Pending ? 'pending' : request.status === RequestStatus.Approved ? 'approved' : 'rejected',
    })) as Request[];
  }),
});
