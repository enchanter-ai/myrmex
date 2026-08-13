import type { ServerType } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { loadConfig } from "../core/config/load.js";
import { createApp } from "./app.js";
import { LOG_MESSAGES, SOURCES } from "./constants/messages.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

export function start(): ServerType {
  try {
    const config = loadConfig();
    logger.info(
      { vendors: config.vendors.length, source: env.signaturesPath ?? SOURCES.BUNDLED },
      LOG_MESSAGES.SIGNATURES_LOADED,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.fatal({ message }, LOG_MESSAGES.SIGNATURES_LOAD_FAILED);
    process.exit(1);
  }

  const app = createApp();
  const server = serve({ fetch: app.fetch, port: env.port, hostname: env.host }, () => {
    logger.info({ host: env.host, port: env.port, version: env.version }, LOG_MESSAGES.LISTENING);
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, LOG_MESSAGES.SHUTTING_DOWN);
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

start();
