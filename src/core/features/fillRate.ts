import type { CheerioAPI } from "cheerio";
import type { SchemaField } from "../types/schemaField.js";
import type { FeatureExtractor } from "./types.js";

function fieldText(dom: CheerioAPI, selector: string): string | null {
  const el = dom(selector).first();
  if (el.length === 0) return null;
  const text = el.text().trim();
  if (text.length > 0) return text;
  for (const attr of ["content", "value", "href", "src"]) {
    const value = el.attr(attr);
    if (value && value.trim().length > 0) return value.trim();
  }
  return null;
}

function isTypeSane(type: SchemaField["type"], text: string): boolean {
  if (type === "number") return Number.isFinite(Number.parseFloat(text));
  if (type === "boolean") return /^(true|false|yes|no|0|1)$/i.test(text);
  return text.length > 0;
}

export const lowFillRate: FeatureExtractor = (ctx) => {
  const { minFillRate } = ctx.config.thresholds;
  const schema = ctx.input.expectedSchema;
  if (!schema) {
    return {
      feature: "low_fill_rate",
      fired: false,
      value: 1,
      threshold: minFillRate,
      implies: "SOFT_BLOCK",
      detail: "no expected schema",
    };
  }
  const total = schema.fields.length;
  let filled = 0;
  for (const field of schema.fields) {
    const text = fieldText(ctx.dom, field.selector);
    if (text !== null && isTypeSane(field.type, text)) filled += 1;
  }
  const fillRate = total === 0 ? 1 : filled / total;
  const fired = fillRate < minFillRate;
  return {
    feature: "low_fill_rate",
    fired,
    value: fillRate,
    threshold: minFillRate,
    implies: "SOFT_BLOCK",
    detail: `${filled}/${total} fields filled`,
  };
};
