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

// Native <input type="month"> submits "" rather than omitting the field when left blank,
// so this accepts both an absent key and an empty string, normalizing either to undefined.
export const yearMonthOptionalSchema = z
  .union([yearMonthSchema, z.literal("")])
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats a "YYYY-MM" string as "Mon YYYY" for display, e.g. "2021-06" -> "Jun 2021". */
export function formatYearMonth(value: string | undefined): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  const monthName = MONTH_NAMES[Number(month) - 1] ?? month;
  return `${monthName} ${year}`;
}

export function formatDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  isCurrent: boolean,
): string {
  const start = formatYearMonth(startDate);
  const end = isCurrent ? "Present" : formatYearMonth(endDate);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} - ${end}`;
}
