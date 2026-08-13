import { z } from "zod";

export const statusRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export type StatusRange = z.infer<typeof statusRangeSchema>;
