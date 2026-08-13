import { z } from "zod";

export const headerMarkerSchema = z.object({
  name: z.string(),
  contains: z.string(),
});

export type HeaderMarker = z.infer<typeof headerMarkerSchema>;
