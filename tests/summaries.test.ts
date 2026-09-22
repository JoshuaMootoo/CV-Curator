import { describe, expect, it } from "vitest";
import { categoryKeys, categoryRegistry } from "@/lib/categories/registry";
import { formatDateRange, formatYearMonth } from "@/lib/categories/common";

describe("formatYearMonth", () => {
  it("formats YYYY-MM as Mon YYYY", () => {
    expect(formatYearMonth("2021-06")).toBe("Jun 2021");
  });

  it("returns an empty string for undefined", () => {
    expect(formatYearMonth(undefined)).toBe("");
  });
});

describe("formatDateRange", () => {
  it("shows Present for a current entry", () => {
    expect(formatDateRange("2021-06", undefined, true)).toBe("Jun 2021 - Present");
  });

  it("shows both dates for a past entry", () => {
    expect(formatDateRange("2017-09", "2020-07", false)).toBe("Sep 2017 - Jul 2020");
  });
});

describe("every category has a deriveSummary that never throws", () => {
  const cases: Record<string, unknown> = {
    header: { fullName: "Jordan Ellis", headline: "Developer" },
    contact: { type: "email", value: "jordan@example.com" },
    statement: { title: "Statement", text: "Some text" },
    experience: {
      role: "Developer",
      organisation: "Acme",
      startDate: "2020-01",
      isCurrent: true,
      bullets: [{ id: "1", text: "Did a thing" }],
    },
    education: {
      institution: "Leeds",
      qualification: "BSc",
      startDate: "2017-09",
      endDate: "2020-07",
      isCurrent: false,
      highlights: [],
    },
    skill: { name: "TypeScript", group: "Languages" },
    project: { name: "CV Curator", bullets: [] },
    certification: { name: "AWS Dev", issuer: "AWS", date: "2022-03" },
    award: { name: "Award", issuer: "Acme", date: "2022-01" },
    interest: { text: "Chess" },
    reference: { mode: "simple", text: "Available on request" },
    custom: { sectionTitle: "Extra", heading: "Talk", bullets: [] },
  };

  for (const key of categoryKeys) {
    it(`derives a summary for ${key}`, () => {
      const config = categoryRegistry[key];
      const parsed = config.schema.parse(cases[key]);
      expect(() => config.deriveSummary(parsed as never)).not.toThrow();
    });
  }
});
