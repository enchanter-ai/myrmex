import type { FeatureExtractor } from "./types.js";

function normalize(counts: Record<string, number>): Record<string, number> {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return {};
  const normalized: Record<string, number> = {};
  for (const [tag, count] of Object.entries(counts)) normalized[tag] = count / total;
  return normalized;
}

function totalVariationDistance(a: Record<string, number>, b: Record<string, number>): number {
  const tags = new Set([...Object.keys(a), ...Object.keys(b)]);
  let sum = 0;
  for (const tag of tags) sum += Math.abs((a[tag] ?? 0) - (b[tag] ?? 0));
  return sum / 2;
}

export const layoutDrift: FeatureExtractor = (ctx) => {
  const { maxLayoutDrift } = ctx.config.thresholds;
  const baseline = ctx.input.baseline;
  if (!baseline) {
    return {
      feature: "layout_drift",
      fired: false,
      value: 0,
      threshold: maxLayoutDrift,
      implies: "LAYOUT_DRIFT",
      detail: "no baseline",
    };
  }
  const actualCounts: Record<string, number> = {};
  ctx.dom("*").each((_, el) => {
    if (el.type !== "tag") return;
    const tag = el.tagName.toLowerCase();
    actualCounts[tag] = (actualCounts[tag] ?? 0) + 1;
  });
  const distance = totalVariationDistance(normalize(baseline.tagCounts), normalize(actualCounts));
  const rounded = Math.round(distance * 10000) / 10000;
  const fired = distance > maxLayoutDrift;
  return {
    feature: "layout_drift",
    fired,
    value: rounded,
    threshold: maxLayoutDrift,
    implies: "LAYOUT_DRIFT",
    detail: `layout distance ${rounded} (max ${maxLayoutDrift})`,
  };
};
