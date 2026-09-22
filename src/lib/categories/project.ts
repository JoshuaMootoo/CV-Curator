import { z } from "zod";
import { subItemSchema, yearMonthOptionalSchema } from "./common";

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
