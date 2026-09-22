import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  group: z.string().min(1, "Group is required"),
});

export type SkillData = z.infer<typeof skillSchema>;

export function skillTitle(data: SkillData): string {
  return `${data.name} (${data.group})`;
}
