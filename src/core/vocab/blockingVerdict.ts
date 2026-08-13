import type { Verdict } from "./verdict.js";

export const BLOCKING_VERDICTS = ["CHALLENGE", "SOFT_BLOCK"] as const satisfies readonly Verdict[];

export type BlockingVerdict = (typeof BLOCKING_VERDICTS)[number];
