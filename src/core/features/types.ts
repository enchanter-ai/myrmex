import type { CheerioAPI } from "cheerio";
import type { Config } from "../config/config.js";
import type { FeatureHit } from "../types/featureHit.js";
import type { ScoreInput } from "../types/scoreInput.js";

export interface FeatureContext {
  input: ScoreInput;
  config: Config;
  dom: CheerioAPI;
  bodyLength: number;
  domNodeCount: number;
  textNodeCount: number;
  visibleText: string;
}

export type FeatureExtractor = (ctx: FeatureContext) => FeatureHit;
