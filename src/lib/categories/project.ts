import { z } from "zod";
import { subItemSchema, yearMonthOptionalSchema, formatDateRange } from "./common";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  startDate: yearMonthOptionalSchema,
  endDate: yearMonthOptionalSchema,
  bullets: z.array(subItemSchema).default([]),
});

export type ProjectData = z.infer<typeof projectSchema>;

export function projectTitle(data: ProjectData): string {
  return data.name;
}

export function projectSummary(data: ProjectData): string {
  const range = formatDateRange(data.startDate, data.endDate, false);
  return [data.subtitle, range].filter(Boolean).join(" · ");
}
