import { z } from "zod";

export const ApproveSchema = z.object({
    requestId: z.number(),
    isApproving: z.boolean()
});
export type InferredApproveSchema = z.infer<typeof ApproveSchema>;