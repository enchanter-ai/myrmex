import { loadConfig } from "../config/load.js";
import { parseDom } from "../dom/parse.js";
import { blockBodyWith200 } from "../features/blockBody.js";
import { lowContentRatio } from "../features/contentRatio.js";
import { decoyEmptyBody } from "../features/decoy.js";
import { lowFillRate } from "../features/fillRate.js";
import { layoutDrift } from "../features/layoutDrift.js";
import type { FeatureContext, FeatureExtractor } from "../features/types.js";
import { vendorChallengeSignature } from "../features/vendor.js";
import type { ScoreInput } from "../types/scoreInput.js";
import type { ScoreResult } from "../types/scoreResult.js";
import { verdictFrom } from "./verdict.js";

const EXTRACTORS: FeatureExtractor[] = [
  vendorChallengeSignature,
  blockBodyWith200,
  decoyEmptyBody,
  lowContentRatio,
  lowFillRate,
  layoutDrift,
];

export function scoreResponse(input: ScoreInput): ScoreResult {
  const config = loadConfig();
  const { dom, domNodeCount, textNodeCount, visibleText } = parseDom(input.response.body);
  const ctx: FeatureContext = {
    input,
    config,
    dom,
    bodyLength: input.response.body.length,
    domNodeCount,
    textNodeCount,
    visibleText,
  };
  const trace = EXTRACTORS.map((extractor) => extractor(ctx));
  const verdict = verdictFrom(trace);
  return { verdict, trace };
}
