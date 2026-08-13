import { Hono } from "hono";
import { loadConfig } from "../core/config/load.js";
import { scoreInputSchema } from "../core/validation/scoreInput.js";
import { scoreResponse } from "../index.js";
import { HTTP_STATUS } from "./constants/httpStatus.js";
import { ERROR_MESSAGES, LOG_MESSAGES } from "./constants/messages.js";
import { HTTP_METHODS } from "./constants/methods.js";
import { ROUTES } from "./constants/routes.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

export function createApp(): Hono {
  const app = new Hono();

  app.get(ROUTES.HEALTH, (c) => {
    const config = loadConfig();
    logger.info(
      { method: HTTP_METHODS.GET, path: ROUTES.HEALTH, status: HTTP_STATUS.OK },
      LOG_MESSAGES.REQUEST_HANDLED,
    );
    return c.json(
      {
        status: "ok",
        version: env.version,
        signatures: { vendors: config.vendors.length, thresholds: config.thresholds },
      },
      HTTP_STATUS.OK,
    );
  });

  app.post(ROUTES.SCORE, async (c) => {
    let json: unknown;
    try {
      json = await c.req.json();
    } catch {
      logger.warn(
        { method: HTTP_METHODS.POST, path: ROUTES.SCORE, status: HTTP_STATUS.BAD_REQUEST },
        LOG_MESSAGES.REQUEST_HANDLED,
      );
      return c.json({ error: ERROR_MESSAGES.INVALID_JSON }, HTTP_STATUS.BAD_REQUEST);
    }
    const parsed = scoreInputSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn(
        { method: HTTP_METHODS.POST, path: ROUTES.SCORE, status: HTTP_STATUS.BAD_REQUEST },
        LOG_MESSAGES.REQUEST_HANDLED,
      );
      return c.json(
        { error: ERROR_MESSAGES.INVALID_INPUT, details: parsed.error.issues },
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const result = scoreResponse(parsed.data);
    logger.info(
      {
        method: HTTP_METHODS.POST,
        path: ROUTES.SCORE,
        status: HTTP_STATUS.OK,
        verdict: result.verdict,
      },
      LOG_MESSAGES.REQUEST_HANDLED,
    );
    return c.json({ verdict: result.verdict, trace: result.trace }, HTTP_STATUS.OK);
  });

  app.all(ROUTES.HEALTH, (c) =>
    c.json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED }, HTTP_STATUS.METHOD_NOT_ALLOWED),
  );
  app.all(ROUTES.SCORE, (c) =>
    c.json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED }, HTTP_STATUS.METHOD_NOT_ALLOWED),
  );

  app.notFound((c) => c.json({ error: ERROR_MESSAGES.NOT_FOUND }, HTTP_STATUS.NOT_FOUND));

  app.onError((error, c) => {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ message }, LOG_MESSAGES.REQUEST_FAILED);
    return c.json({ error: ERROR_MESSAGES.INTERNAL_ERROR }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  return app;
}
