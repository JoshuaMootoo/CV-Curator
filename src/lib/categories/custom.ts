import { z } from "zod";
import { subItemSchema, yearMonthOptionalSchema, formatYearMonth } from "./common";

export const customSchema = z.object({
  sectionTitle: z.string().min(1, "Section title is required"),
  heading: z.string().min(1, "Heading is required"),
  subheading: z.string().optional(),
  date: yearMonthOptionalSchema,
  bullets: z.array(subItemSchema).default([]),
});

export type CustomData = z.infer<typeof customSchema>;

export function customTitle(data: CustomData): string {
  return `${data.heading} (${data.sectionTitle})`;
}

export function customSummary(data: CustomData): string {
  return [data.subheading, formatYearMonth(data.date)].filter(Boolean).join(" · ");
}
