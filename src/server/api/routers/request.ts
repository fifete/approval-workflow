import { z } from "zod";
import { Request, RequestStatus } from "~/types";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.request.findMany({
      where: {
        OR: [
          { approverId: ctx.session.user.id },
          { createdById: ctx.session.user.id },
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
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        effectDate: 'asc',
      },
    });

    return requests.map(request => ({
      id: request.id,
      workerName: request.creator.name,
      effectDate: request.effectDate,
      description: request.description,
      minutes: request.minutes,
      approver: request.approver.name,
      approverId: Number(request.approver.id),
      status: request.status === RequestStatus.Pending ? 'pending' : request.status === RequestStatus.Approved ? 'approved' : 'rejected',
    })) as Request[];
  }),
  approve: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.request.update({
        where: { id: input },
        data: { status: RequestStatus.Approved },
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
        status: 'approved',
      } as Request;
    }),

  reject: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
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
        status: 'rejected',
      } as Request;
    }),

  getSessionUserId: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user.id;
  }),
});
