export const LOG_MESSAGES = {
  SIGNATURES_LOADED: "signatures loaded",
  SIGNATURES_LOAD_FAILED: "fatal: could not load signatures",
  LISTENING: "listening",
  REQUEST_HANDLED: "request handled",
  REQUEST_FAILED: "request failed",
  SHUTTING_DOWN: "shutting down",
} as const;

export const ERROR_MESSAGES = {
  INVALID_JSON: "request body is not valid JSON",
  INVALID_INPUT: "invalid score input",
  METHOD_NOT_ALLOWED: "method not allowed",
  NOT_FOUND: "not found",
  INTERNAL_ERROR: "internal error",
} as const;

export const SOURCES = {
  BUNDLED: "bundled signatures.json",
} as const;
