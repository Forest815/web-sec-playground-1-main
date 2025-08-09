import { z } from "zod";

export const loginHistorySchema = z.object({
  id: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  success: z.boolean(),
  createdAt: z.date(),
});

export type LoginHistory = z.infer<typeof loginHistorySchema>;
