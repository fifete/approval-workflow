import { z } from "zod";

export const ApproveSchema = z.object({
    requestId: z.number(),
    isApproving: z.boolean()
});
export type InferredApproveSchema = z.infer<typeof ApproveSchema>;

export const CreateSchema = z.object({
    description: z.string(),
    minutes: z.number(),
});

export type InferredCreateSchema = z.infer<typeof CreateSchema>;