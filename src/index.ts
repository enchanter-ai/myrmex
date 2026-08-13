export { scoreResponse } from "./core/engine/score.js";
export { verdictFrom } from "./core/engine/verdict.js";
export { loadConfig, SIGNATURES_PATH } from "./core/config/load.js";
export { VERDICTS } from "./core/vocab/verdict.js";
export { BLOCKING_VERDICTS } from "./core/vocab/blockingVerdict.js";
export { isVerdict } from "./core/vocab/isVerdict.js";
export { isBlockingVerdict } from "./core/vocab/isBlockingVerdict.js";
export { FEATURES } from "./core/vocab/feature.js";
export { FIELD_TYPES } from "./core/types/fieldType.js";
export { scoreInputShape, scoreInputSchema } from "./core/validation/scoreInput.js";
export type { Verdict } from "./core/vocab/verdict.js";
export type { BlockingVerdict } from "./core/vocab/blockingVerdict.js";
export type { FeatureName } from "./core/vocab/feature.js";
export type {
  HttpResponse,
  ScoreInput,
  ExpectedSchema,
  SchemaField,
  FieldType,
  LayoutBaseline,
  FeatureHit,
  ScoreResult,
} from "./core/types/index.js";
export type { Config } from "./core/config/config.js";
export type { VendorSignature } from "./core/config/vendorSignature.js";
export type { Thresholds } from "./core/config/thresholds.js";
