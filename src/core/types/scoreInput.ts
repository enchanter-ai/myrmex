import type { ExpectedSchema } from "./expectedSchema.js";
import type { HttpResponse } from "./httpResponse.js";
import type { LayoutBaseline } from "./layoutBaseline.js";

export interface ScoreInput {
  response: HttpResponse;
  expectedSchema?: ExpectedSchema;
  baseline?: LayoutBaseline;
}
