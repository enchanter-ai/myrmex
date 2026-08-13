import { z } from "zod";
import { FIELD_TYPES } from "../types/fieldType.js";

export const scoreInputShape = {
  response: z.object({
    status: z.number(),
    headers: z.record(z.string()),
    body: z.string(),
  }),
  expectedSchema: z
    .object({
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.enum(FIELD_TYPES),
          selector: z.string(),
        }),
      ),
    })
    .optional(),
  baseline: z
    .object({
      tagCounts: z.record(z.number()),
    })
    .optional(),
};

export const scoreInputSchema = z.object(scoreInputShape);
