import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ENV_KEYS } from "../core/config/envKeys.js";
import { DEFAULTS } from "./constants/defaults.js";

const HERE = dirname(fileURLToPath(import.meta.url));

function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(HERE, "..", "..", "package.json"), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? DEFAULTS.VERSION;
  } catch {
    return DEFAULTS.VERSION;
  }
}

export interface ServiceEnv {
  port: number;
  host: string;
  signaturesPath: string | null;
  logLevel: string;
  version: string;
}

const rawPort = process.env[ENV_KEYS.PORT];

export const env: ServiceEnv = {
  port: rawPort === undefined ? DEFAULTS.PORT : Number.parseInt(rawPort, 10),
  host: process.env[ENV_KEYS.HOST] ?? DEFAULTS.HOST,
  signaturesPath: process.env[ENV_KEYS.SIGNATURES_PATH] ?? null,
  logLevel: process.env[ENV_KEYS.LOG_LEVEL] ?? DEFAULTS.LOG_LEVEL,
  version: readVersion(),
};
