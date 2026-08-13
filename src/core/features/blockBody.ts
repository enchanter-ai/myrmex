import type { FeatureExtractor } from "./types.js";
import { matchVendors } from "./vendor.js";

export const blockBodyWith200: FeatureExtractor = (ctx) => {
  const { min, max } = ctx.config.thresholds.successStatus;
  const status = ctx.input.response.status;
  const inSuccessRange = status >= min && status <= max;
  const matches = matchVendors(ctx.input.response, ctx.config);
  const fired = inSuccessRange && matches.length > 0;
  const vendors = matches.map((match) => match.vendor).join(", ");
  return {
    feature: "block_body_with_200",
    fired,
    value: status,
    threshold: min,
    detail: fired
      ? `status ${status} served a block body (${vendors})`
      : `status ${status}, vendors matched: ${matches.length}`,
    implies: "SOFT_BLOCK",
  };
};
