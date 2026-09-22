import { z } from "zod";

export const statementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Text is required"),
});

export type StatementData = z.infer<typeof statementSchema>;

export function statementTitle(data: StatementData): string {
  return data.title;
}

export function statementSummary(data: StatementData): string {
  return data.text.length > 100 ? `${data.text.slice(0, 100)}...` : data.text;
}
