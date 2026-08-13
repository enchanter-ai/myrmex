import type { FeatureName } from "../vocab/feature.js";
import type { Verdict } from "../vocab/verdict.js";

export interface FeatureHit {
  feature: FeatureName;
  fired: boolean;
  value: number;
  threshold: number;
  detail: string;
  implies: Verdict | null;
}
