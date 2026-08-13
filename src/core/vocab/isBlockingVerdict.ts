import type { BlockingVerdict } from "./blockingVerdict.js";
import { BLOCKING_VERDICTS } from "./blockingVerdict.js";
import type { Verdict } from "./verdict.js";

export function isBlockingVerdict(value: Verdict | null): value is BlockingVerdict {
  return value !== null && (BLOCKING_VERDICTS as readonly string[]).includes(value);
}
