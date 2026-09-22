import { z } from "zod";

export const referenceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("simple"),
    text: z.string().min(1, "Text is required"),
  }),
  z.object({
    mode: z.literal("detailed"),
    name: z.string().min(1, "Name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    contactDetails: z.string().min(1, "Contact details are required"),
  }),
]);

export type ReferenceData = z.infer<typeof referenceSchema>;

export function referenceTitle(data: ReferenceData): string {
  return data.mode === "simple" ? data.text : data.name;
}

export function referenceSummary(data: ReferenceData): string {
  return data.mode === "simple" ? "" : data.relationship;
}
