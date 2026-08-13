import { z } from "zod";
import { BLOCKING_VERDICTS } from "../vocab/blockingVerdict.js";
import { headerMarkerSchema } from "./headerMarker.js";

export const vendorSignatureSchema = z.object({
  vendor: z.string(),
  implies: z.enum(BLOCKING_VERDICTS),
  bodyMarkers: z.array(z.string()),
  headerMarkers: z.array(headerMarkerSchema),
});

export type VendorSignature = z.infer<typeof vendorSignatureSchema>;
