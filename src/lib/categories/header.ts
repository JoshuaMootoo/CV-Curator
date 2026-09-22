import { z } from "zod";

export const headerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  headline: z.string().optional(),
});

export type HeaderData = z.infer<typeof headerSchema>;

export function headerTitle(data: HeaderData): string {
  return data.fullName || "Header";
}
