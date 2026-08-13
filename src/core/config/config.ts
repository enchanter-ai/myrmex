import { z } from "zod";
import { thresholdsSchema } from "./thresholds.js";
import { vendorSignatureSchema } from "./vendorSignature.js";

export const configSchema = z.object({
  vendors: z.array(vendorSignatureSchema),
  thresholds: thresholdsSchema,
});

export type Config = z.infer<typeof configSchema>;
