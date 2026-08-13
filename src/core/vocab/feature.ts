export const FEATURES = [
  "vendor_challenge_signature",
  "block_body_with_200",
  "decoy_empty_body",
  "low_content_ratio",
  "low_fill_rate",
  "layout_drift",
] as const;

export type FeatureName = (typeof FEATURES)[number];
