import { z } from "zod";
import { subItemSchema, yearMonthSchema, yearMonthOptionalSchema } from "./common";

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
