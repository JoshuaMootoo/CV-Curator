import { z } from "zod";

export const subItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Cannot be empty"),
});

export type SubItem = z.infer<typeof subItemSchema>;

// YYYY-MM
export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected format YYYY-MM");

export const yearMonthOptionalSchema = yearMonthSchema.optional();
