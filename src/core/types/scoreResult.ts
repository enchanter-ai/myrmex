import type { Verdict } from "../vocab/verdict.js";
import type { FeatureHit } from "./featureHit.js";

export interface ScoreResult {
  verdict: Verdict;
  trace: FeatureHit[];
}
