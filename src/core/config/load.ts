import { readFileSync } from "node:fs";
import { configSchema } from "./config.js";
import type { Config } from "./config.js";
import { ENV_KEYS } from "./envKeys.js";
import {
  bundledSignaturesInvalid,
  signaturesInvalid,
  signaturesNotJson,
  signaturesUnreadable,
} from "./messages.js";
import signaturesJson from "./signatures.json" with { type: "json" };

export const SIGNATURES_PATH: string | null = process.env[ENV_KEYS.SIGNATURES_PATH] ?? null;

let cached: Config | undefined;

function readFromPath(path: string): Config {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (cause) {
    throw new Error(signaturesUnreadable(path), { cause });
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (cause) {
    throw new Error(signaturesNotJson(path), { cause });
  }
  const parsed = configSchema.safeParse(json);
  if (!parsed.success) throw new Error(signaturesInvalid(path, parsed.error));
  return parsed.data;
}

function readBundled(): Config {
  const parsed = configSchema.safeParse(signaturesJson);
  if (!parsed.success) throw new Error(bundledSignaturesInvalid(parsed.error));
  return parsed.data;
}

export function loadConfig(): Config {
  if (cached === undefined) {
    cached = SIGNATURES_PATH === null ? readBundled() : readFromPath(SIGNATURES_PATH);
  }
  return cached;
}
