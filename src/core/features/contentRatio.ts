import type { FeatureExtractor } from "./types.js";

export const lowContentRatio: FeatureExtractor = (ctx) => {
  const ratio = ctx.visibleText.length / Math.max(ctx.bodyLength, 1);
  const rounded = Math.round(ratio * 10000) / 10000;
  const { minContentRatio } = ctx.config.thresholds;
  const fired = ratio < minContentRatio;
  return {
    feature: "low_content_ratio",
    fired,
    value: rounded,
    threshold: minContentRatio,
    detail: `visible text ratio ${rounded} (min ${minContentRatio})`,
    implies: "DECOY_EMPTY",
  };
};
