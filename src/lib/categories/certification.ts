import { z } from "zod";
import { yearMonthSchema, formatYearMonth } from "./common";

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: yearMonthSchema,
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CertificationData = z.infer<typeof certificationSchema>;

export function certificationTitle(data: CertificationData): string {
  return `${data.name}, ${data.issuer}`;
}

export function certificationSummary(data: CertificationData): string {
  return formatYearMonth(data.date);
}
