import { z } from "zod";
import { yearMonthSchema } from "./common";

export const awardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: yearMonthSchema,
  description: z.string().optional(),
});

export type AwardData = z.infer<typeof awardSchema>;

export function awardTitle(data: AwardData): string {
  return `${data.name}, ${data.issuer}`;
}
