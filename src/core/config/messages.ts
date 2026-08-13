import type { ZodError } from "zod";

export function signaturesUnreadable(path: string): string {
  return `myrmex: signatures file not found or unreadable at ${path}`;
}

export function signaturesNotJson(path: string): string {
  return `myrmex: signatures file at ${path} is not valid JSON`;
}

export function signaturesInvalid(path: string, error: ZodError): string {
  return `myrmex: signatures file at ${path} failed validation: ${error.message}`;
}

export function bundledSignaturesInvalid(error: ZodError): string {
  return `myrmex: bundled signatures.json failed validation: ${error.message}`;
}
