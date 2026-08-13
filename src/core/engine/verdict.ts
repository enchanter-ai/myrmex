import type { FeatureHit } from "../types/featureHit.js";
import { assertNever } from "../vocab/assertNever.js";
import type { BlockingVerdict } from "../vocab/blockingVerdict.js";
import { isBlockingVerdict } from "../vocab/isBlockingVerdict.js";
import type { Verdict } from "../vocab/verdict.js";

function hitFor(hits: FeatureHit[], feature: FeatureHit["feature"]): FeatureHit | undefined {
  return hits.find((hit) => hit.feature === feature && hit.fired);
}

function verdictForBlocking(implies: BlockingVerdict): Verdict {
  switch (implies) {
    case "CHALLENGE":
      return "CHALLENGE";
    case "SOFT_BLOCK":
      return "SOFT_BLOCK";
    default:
      return assertNever(implies);
  }
}

export function verdictFrom(hits: FeatureHit[]): Verdict {
  const vendorHit = hitFor(hits, "vendor_challenge_signature");
  if (vendorHit && isBlockingVerdict(vendorHit.implies))
    return verdictForBlocking(vendorHit.implies);
  if (hitFor(hits, "block_body_with_200")) return "SOFT_BLOCK";
  if (hitFor(hits, "decoy_empty_body") || hitFor(hits, "low_content_ratio")) return "DECOY_EMPTY";
  if (hitFor(hits, "low_fill_rate")) return "SOFT_BLOCK";
  if (hitFor(hits, "layout_drift")) return "LAYOUT_DRIFT";
  return "REAL";
}
