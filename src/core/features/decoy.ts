import type { FeatureExtractor } from "./types.js";

export const decoyEmptyBody: FeatureExtractor = (ctx) => {
  const { minContentLength, minDomNodes, minTextNodes } = ctx.config.thresholds;
  const reasons: string[] = [];
  if (ctx.bodyLength < minContentLength)
    reasons.push(`bodyLength ${ctx.bodyLength} < ${minContentLength}`);
  if (ctx.domNodeCount < minDomNodes)
    reasons.push(`domNodeCount ${ctx.domNodeCount} < ${minDomNodes}`);
  if (ctx.textNodeCount < minTextNodes)
    reasons.push(`textNodeCount ${ctx.textNodeCount} < ${minTextNodes}`);
  const fired = reasons.length > 0;
  return {
    feature: "decoy_empty_body",
    fired,
    value: ctx.domNodeCount,
    threshold: minDomNodes,
    detail: fired ? reasons.join("; ") : "content thresholds satisfied",
    implies: "DECOY_EMPTY",
  };
};
