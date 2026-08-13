import { z } from "zod";
import { statusRangeSchema } from "./statusRange.js";

export const thresholdsSchema = z.object({
  successStatus: statusRangeSchema,
  minContentLength: z.number(),
  minDomNodes: z.number(),
  minTextNodes: z.number(),
  minContentRatio: z.number(),
  minFillRate: z.number(),
  maxLayoutDrift: z.number(),
});

export type Thresholds = z.infer<typeof thresholdsSchema>;
