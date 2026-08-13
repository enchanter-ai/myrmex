export const VERDICTS = ["REAL", "SOFT_BLOCK", "CHALLENGE", "DECOY_EMPTY", "LAYOUT_DRIFT"] as const;

export type Verdict = (typeof VERDICTS)[number];
