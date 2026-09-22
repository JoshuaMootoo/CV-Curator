import type { z } from "zod";

export type FieldKind =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "subitems"
  | "url";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  /** Name of another field this one should be hidden/disabled by, e.g. endDate hidden when isCurrent is true. */
  hiddenWhen?: { field: string; equals: unknown };
}

export interface CategoryConfig<Data = unknown> {
  key: string;
  label: string;
  /** Section heading shown on the CV, or null when the category has no visible section (header/contact). */
  sectionHeading: string | null;
  schema: z.ZodType<Data>;
  fields: FieldConfig[];
  deriveTitle: (data: Data) => string;
}
