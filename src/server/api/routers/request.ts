import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rejectRequest } from "~/server/repository/request";
import { Approve } from "~/server/application/request";
import { ApproveSchema } from "~/server/zodTypes/request";
import { Request as RequestMapped } from "~/types";

export const requestRouter = createTRPCRouter({
  listAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const userSession = await ctx.db.user.findUnique({
        where: { id: userId },
      });
      if (!userSession) throw new Error("User not found");

      const requests = await ctx.db.request.findMany({
        // where: {
        //   OR: [
        //     ...(userSession.rol.toString() === Roles.DIRECTOR.toString()
        //       ? [{}] // All requests
        //       : [{ createdById: userId }]),
        //   ]
        //   createdById: '2'
        // },
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
          WorkflowRequest: {
            select: {
              status: true,
              nextApproverId: true,
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

      const formatted = requests.map(async request => {
        if (!request.WorkflowRequest) {
          throw new Error("Workflow not found");
        }
        const nextApproverUser = await ctx.db.user.findUnique({
          where: {
            id: request.WorkflowRequest.nextApproverId,
          },
          select: {
            id: true,
            name: true,
          },
        })

        if (!nextApproverUser) {
          throw new Error("Next approver not found");
        }

        const mapped = {
          id: request.id,
          workerName: request.creator.name,
          effectDate: request.effectDate,
          description: request.description,
          minutes: request.minutes,
          approver: nextApproverUser.name,
          approverId: Number(nextApproverUser.id),
          status: request.status,
        } as RequestMapped;

        return mapped;
      });

      return await Promise.all(formatted);
    }),
  approve: protectedProcedure
    .input(ApproveSchema)
    .mutation(async ({ ctx, input }) => {
      return await Approve(ctx, input);
    }),

  reject: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await rejectRequest(ctx, input);
    }),

  getSessionUserId: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user.id;
  }),
});
