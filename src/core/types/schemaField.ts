import type { FieldType } from "./fieldType.js";

export interface SchemaField {
  name: string;
  type: FieldType;
  selector: string;
}
