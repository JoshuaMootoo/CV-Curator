import { z } from "zod";

export const contactTypeSchema = z.enum([
  "email",
  "phone",
  "location",
  "linkedin",
  "github",
  "website",
  "other",
]);

export const contactSchema = z.object({
  type: contactTypeSchema,
  value: z.string().min(1, "Value is required"),
  label: z.string().optional(),
});

export type ContactData = z.infer<typeof contactSchema>;

export function contactTitle(data: ContactData): string {
  return data.label || `${data.type}: ${data.value}`;
}
