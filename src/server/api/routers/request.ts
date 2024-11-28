import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rejectRequest } from "~/server/repository/request";
import { Approve } from "~/server/application/request";
import { ApproveSchema } from "~/server/zodTypes/request";
import { Request as RequestMapped } from "~/types";
import { Roles } from "../constants/enums";

export const requestRouter = createTRPCRouter({
  listAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const userSession = await ctx.db.user.findUnique({
        where: { id: userId },
      });
      if (!userSession) throw new Error("User not found");

      const requests = await ctx.db.request.findMany({
        where: {
          OR: [
            ...(userSession.rol === Number(Roles.DIRECTOR.toString()) || userSession.rol === Number(Roles.LEADER.toString())
              ? [{
                NOT: { id: 0 },
              }] // All requests
              : [{ createdById: userId }]),
          ]
        },
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
          updater: {
            select: {
              name: true,
            },
          },
          WorkflowRequest: {
            select: {
              status: true,
              approver: {
                select: {
                  id: true,
                  name: true,
                }
              }
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

        const mapped = {
          id: request.id,
          workerName: request.creator.name,
          effectDate: request.effectDate,
          description: request.description,
          minutes: request.minutes,
          approver: request.WorkflowRequest.approver.name,
          approverId: Number(request.WorkflowRequest.approver.id),
          updaterName: request.updater?.name || "",
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
