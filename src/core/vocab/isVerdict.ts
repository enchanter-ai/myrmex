import type { Verdict } from "./verdict.js";
import { VERDICTS } from "./verdict.js";

export function isVerdict(value: string): value is Verdict {
  return (VERDICTS as readonly string[]).includes(value);
}
