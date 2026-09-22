import { describe, expect, it } from "vitest";
import { headerSchema } from "@/lib/categories/header";
import { contactSchema } from "@/lib/categories/contact";
import { statementSchema } from "@/lib/categories/statement";
import { experienceSchema } from "@/lib/categories/experience";
import { educationSchema } from "@/lib/categories/education";
import { skillSchema } from "@/lib/categories/skill";
import { projectSchema } from "@/lib/categories/project";
import { certificationSchema } from "@/lib/categories/certification";
import { awardSchema } from "@/lib/categories/award";
import { interestSchema } from "@/lib/categories/interest";
import { referenceSchema } from "@/lib/categories/reference";
import { customSchema } from "@/lib/categories/custom";
import { categoryKeys, categoryRegistry } from "@/lib/categories/registry";

describe("category registry", () => {
  it("registers all categories from the spec", () => {
    expect(new Set(categoryKeys)).toEqual(
      new Set([
        "header",
        "contact",
        "statement",
        "experience",
        "education",
        "skill",
        "project",
        "certification",
        "award",
        "interest",
        "reference",
        "custom",
      ]),
    );
  });

  it("every category can derive a title from valid data", () => {
    const cases: Record<string, unknown> = {
      header: { fullName: "Jordan Ellis" },
      contact: { type: "email", value: "jordan@example.com" },
      statement: { title: "Statement", text: "Some text" },
      experience: {
        role: "Developer",
        organisation: "Acme",
        startDate: "2020-01",
        isCurrent: true,
        bullets: [],
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
      const config = categoryRegistry[key];
      const parsed = config.schema.parse(cases[key]);
      expect(config.deriveTitle(parsed as never)).toBeTruthy();
    }
  });
});

describe("headerSchema", () => {
  it("accepts a full name with optional headline", () => {
    expect(
      headerSchema.parse({ fullName: "Jordan Ellis", headline: "Developer" }),
    ).toMatchObject({ fullName: "Jordan Ellis" });
  });

  it("rejects a missing full name", () => {
    expect(() => headerSchema.parse({})).toThrow();
  });
});

describe("contactSchema", () => {
  it("accepts a valid email contact", () => {
    expect(
      contactSchema.parse({ type: "email", value: "a@b.com" }),
    ).toMatchObject({ type: "email" });
  });

  it("rejects an invalid type", () => {
    expect(() =>
      contactSchema.parse({ type: "fax", value: "123" }),
    ).toThrow();
  });

  it("rejects a missing value", () => {
    expect(() => contactSchema.parse({ type: "email", value: "" })).toThrow();
  });
});

describe("statementSchema", () => {
  it("accepts valid data", () => {
    expect(
      statementSchema.parse({ title: "Statement", text: "Hello" }),
    ).toMatchObject({ title: "Statement" });
  });

  it("rejects empty text", () => {
    expect(() =>
      statementSchema.parse({ title: "Statement", text: "" }),
    ).toThrow();
  });
});

describe("experienceSchema", () => {
  it("accepts a current role without an end date", () => {
    expect(
      experienceSchema.parse({
        role: "Developer",
        organisation: "Acme",
        startDate: "2020-01",
        isCurrent: true,
        bullets: [{ id: "1", text: "Did things" }],
      }),
    ).toMatchObject({ role: "Developer" });
  });

  it("rejects a badly formatted start date", () => {
    expect(() =>
      experienceSchema.parse({
        role: "Developer",
        organisation: "Acme",
        startDate: "2020",
        isCurrent: true,
      }),
    ).toThrow();
  });

  it("rejects a missing organisation", () => {
    expect(() =>
      experienceSchema.parse({
        role: "Developer",
        startDate: "2020-01",
        isCurrent: true,
      }),
    ).toThrow();
  });
});

describe("educationSchema", () => {
  it("accepts valid data with highlights", () => {
    expect(
      educationSchema.parse({
        institution: "Leeds",
        qualification: "BSc",
        startDate: "2017-09",
        endDate: "2020-07",
        isCurrent: false,
        highlights: [{ id: "1", text: "Dissertation prize" }],
      }),
    ).toMatchObject({ institution: "Leeds" });
  });

  it("rejects a missing qualification", () => {
    expect(() =>
      educationSchema.parse({
        institution: "Leeds",
        startDate: "2017-09",
        isCurrent: false,
      }),
    ).toThrow();
  });
});

describe("skillSchema", () => {
  it("accepts a name and group", () => {
    expect(
      skillSchema.parse({ name: "TypeScript", group: "Languages" }),
    ).toMatchObject({ name: "TypeScript" });
  });

  it("rejects a missing group", () => {
    expect(() => skillSchema.parse({ name: "TypeScript", group: "" })).toThrow();
  });
});

describe("projectSchema", () => {
  it("accepts a project with only a name", () => {
    expect(projectSchema.parse({ name: "CV Curator", bullets: [] })).toMatchObject({
      name: "CV Curator",
    });
  });

  it("rejects an invalid link", () => {
    expect(() =>
      projectSchema.parse({ name: "CV Curator", link: "not-a-url" }),
    ).toThrow();
  });
});

describe("certificationSchema", () => {
  it("accepts valid data", () => {
    expect(
      certificationSchema.parse({ name: "AWS Dev", issuer: "AWS", date: "2022-03" }),
    ).toMatchObject({ name: "AWS Dev" });
  });

  it("rejects a missing date", () => {
    expect(() =>
      certificationSchema.parse({ name: "AWS Dev", issuer: "AWS" }),
    ).toThrow();
  });
});

describe("awardSchema", () => {
  it("accepts valid data", () => {
    expect(
      awardSchema.parse({ name: "Award", issuer: "Acme", date: "2022-01" }),
    ).toMatchObject({ name: "Award" });
  });

  it("rejects a missing issuer", () => {
    expect(() => awardSchema.parse({ name: "Award", date: "2022-01" })).toThrow();
  });
});

describe("interestSchema", () => {
  it("accepts non-empty text", () => {
    expect(interestSchema.parse({ text: "Chess" })).toMatchObject({ text: "Chess" });
  });

  it("rejects empty text", () => {
    expect(() => interestSchema.parse({ text: "" })).toThrow();
  });
});

describe("referenceSchema", () => {
  it("accepts a simple reference", () => {
    expect(
      referenceSchema.parse({ mode: "simple", text: "Available on request" }),
    ).toMatchObject({ mode: "simple" });
  });

  it("accepts a detailed reference", () => {
    expect(
      referenceSchema.parse({
        mode: "detailed",
        name: "Sam Taylor",
        relationship: "Manager",
        contactDetails: "sam@example.com",
      }),
    ).toMatchObject({ mode: "detailed" });
  });

  it("rejects a detailed reference missing a name", () => {
    expect(() =>
      referenceSchema.parse({
        mode: "detailed",
        relationship: "Manager",
        contactDetails: "sam@example.com",
      }),
    ).toThrow();
  });
});

describe("customSchema", () => {
  it("accepts valid data", () => {
    expect(
      customSchema.parse({ sectionTitle: "Extra", heading: "Talk", bullets: [] }),
    ).toMatchObject({ sectionTitle: "Extra" });
  });

  it("rejects a missing heading", () => {
    expect(() => customSchema.parse({ sectionTitle: "Extra" })).toThrow();
  });
});
