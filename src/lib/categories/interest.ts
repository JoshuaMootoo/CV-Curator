import { z } from "zod";

export const interestSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export type InterestData = z.infer<typeof interestSchema>;

export function interestTitle(data: InterestData): string {
  return data.text;
}
