import { z } from "zod";
import {
  subItemSchema,
  yearMonthSchema,
  yearMonthOptionalSchema,
  formatDateRange,
} from "./common";

export const experienceSchema = z.object({
  role: z.string().min(1, "Role is required"),
  organisation: z.string().min(1, "Organisation is required"),
  location: z.string().optional(),
  startDate: yearMonthSchema,
  endDate: yearMonthOptionalSchema,
  isCurrent: z.boolean().default(false),
  bullets: z.array(subItemSchema).default([]),
});

export type ExperienceData = z.infer<typeof experienceSchema>;

export function experienceTitle(data: ExperienceData): string {
  return `${data.role}, ${data.organisation}`;
}

export function experienceSummary(data: ExperienceData): string {
  const range = formatDateRange(data.startDate, data.endDate, data.isCurrent);
  const bulletCount = `${data.bullets.length} bullet${data.bullets.length === 1 ? "" : "s"}`;
  return [range, bulletCount].filter(Boolean).join(" · ");
}
