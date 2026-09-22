import { z } from "zod";
import {
  subItemSchema,
  yearMonthSchema,
  yearMonthOptionalSchema,
  formatDateRange,
} from "./common";

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  qualification: z.string().min(1, "Qualification is required"),
  grade: z.string().optional(),
  location: z.string().optional(),
  startDate: yearMonthSchema,
  endDate: yearMonthOptionalSchema,
  isCurrent: z.boolean().default(false),
  highlights: z.array(subItemSchema).default([]),
});

export type EducationData = z.infer<typeof educationSchema>;

export function educationTitle(data: EducationData): string {
  return `${data.qualification}, ${data.institution}`;
}

export function educationSummary(data: EducationData): string {
  const range = formatDateRange(data.startDate, data.endDate, data.isCurrent);
  return [range, data.grade].filter(Boolean).join(" · ");
}
