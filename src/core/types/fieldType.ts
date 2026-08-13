export const FIELD_TYPES = ["string", "number", "boolean", "array", "object"] as const;

export type FieldType = (typeof FIELD_TYPES)[number];
