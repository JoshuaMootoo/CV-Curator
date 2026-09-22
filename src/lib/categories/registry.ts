import type { CategoryConfig } from "./types";
import { headerSchema, headerTitle, type HeaderData } from "./header";
import { contactSchema, contactTitle, type ContactData } from "./contact";
import { statementSchema, statementTitle, type StatementData } from "./statement";
import { experienceSchema, experienceTitle, type ExperienceData } from "./experience";
import { educationSchema, educationTitle, type EducationData } from "./education";
import { skillSchema, skillTitle, type SkillData } from "./skill";
import { projectSchema, projectTitle, type ProjectData } from "./project";
import {
  certificationSchema,
  certificationTitle,
  type CertificationData,
} from "./certification";
import { awardSchema, awardTitle, type AwardData } from "./award";
import { interestSchema, interestTitle, type InterestData } from "./interest";
import { referenceSchema, referenceTitle, type ReferenceData } from "./reference";
import { customSchema, customTitle, type CustomData } from "./custom";

export const categoryRegistry = {
  header: {
    key: "header",
    label: "Header",
    sectionHeading: null,
    schema: headerSchema,
    deriveTitle: headerTitle,
    fields: [
      { name: "fullName", label: "Full name", kind: "text", required: true },
      { name: "headline", label: "Headline", kind: "text" },
    ],
  } satisfies CategoryConfig<HeaderData>,

  contact: {
    key: "contact",
    label: "Contact",
    sectionHeading: null,
    schema: contactSchema,
    deriveTitle: contactTitle,
    fields: [
      {
        name: "type",
        label: "Type",
        kind: "select",
        required: true,
        options: [
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
          { label: "Location", value: "location" },
          { label: "LinkedIn", value: "linkedin" },
          { label: "GitHub", value: "github" },
          { label: "Website", value: "website" },
          { label: "Other", value: "other" },
        ],
      },
      { name: "value", label: "Value", kind: "text", required: true },
      { name: "label", label: "Display text", kind: "text" },
    ],
  } satisfies CategoryConfig<ContactData>,

  statement: {
    key: "statement",
    label: "Personal Statement",
    sectionHeading: "Personal Statement",
    schema: statementSchema,
    deriveTitle: statementTitle,
    fields: [
      { name: "title", label: "Title (library only)", kind: "text", required: true },
      { name: "text", label: "Text", kind: "textarea", required: true },
    ],
  } satisfies CategoryConfig<StatementData>,

  experience: {
    key: "experience",
    label: "Experience",
    sectionHeading: "Experience",
    schema: experienceSchema,
    deriveTitle: experienceTitle,
    fields: [
      { name: "role", label: "Role", kind: "text", required: true },
      { name: "organisation", label: "Organisation", kind: "text", required: true },
      { name: "location", label: "Location", kind: "text" },
      { name: "startDate", label: "Start date", kind: "date", required: true },
      {
        name: "endDate",
        label: "End date",
        kind: "date",
        hiddenWhen: { field: "isCurrent", equals: true },
      },
      { name: "isCurrent", label: "Current role", kind: "checkbox" },
      { name: "bullets", label: "Bullets", kind: "subitems" },
    ],
  } satisfies CategoryConfig<ExperienceData>,

  education: {
    key: "education",
    label: "Education",
    sectionHeading: "Education",
    schema: educationSchema,
    deriveTitle: educationTitle,
    fields: [
      { name: "institution", label: "Institution", kind: "text", required: true },
      { name: "qualification", label: "Qualification", kind: "text", required: true },
      { name: "grade", label: "Grade", kind: "text" },
      { name: "location", label: "Location", kind: "text" },
      { name: "startDate", label: "Start date", kind: "date", required: true },
      {
        name: "endDate",
        label: "End date",
        kind: "date",
        hiddenWhen: { field: "isCurrent", equals: true },
      },
      { name: "isCurrent", label: "Currently studying", kind: "checkbox" },
      { name: "highlights", label: "Highlights", kind: "subitems" },
    ],
  } satisfies CategoryConfig<EducationData>,

  skill: {
    key: "skill",
    label: "Skill",
    sectionHeading: "Skills",
    schema: skillSchema,
    deriveTitle: skillTitle,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "group", label: "Group", kind: "text", required: true, placeholder: "e.g. Languages" },
    ],
  } satisfies CategoryConfig<SkillData>,

  project: {
    key: "project",
    label: "Project",
    sectionHeading: "Projects",
    schema: projectSchema,
    deriveTitle: projectTitle,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "subtitle", label: "Subtitle", kind: "text", placeholder: "e.g. tech used" },
      { name: "link", label: "Link", kind: "url" },
      { name: "startDate", label: "Start date", kind: "date" },
      { name: "endDate", label: "End date", kind: "date" },
      { name: "bullets", label: "Bullets", kind: "subitems" },
    ],
  } satisfies CategoryConfig<ProjectData>,

  certification: {
    key: "certification",
    label: "Certification",
    sectionHeading: "Certifications",
    schema: certificationSchema,
    deriveTitle: certificationTitle,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "issuer", label: "Issuer", kind: "text", required: true },
      { name: "date", label: "Date", kind: "date", required: true },
      { name: "link", label: "Link", kind: "url" },
    ],
  } satisfies CategoryConfig<CertificationData>,

  award: {
    key: "award",
    label: "Award",
    sectionHeading: "Awards",
    schema: awardSchema,
    deriveTitle: awardTitle,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "issuer", label: "Issuer", kind: "text", required: true },
      { name: "date", label: "Date", kind: "date", required: true },
      { name: "description", label: "Description", kind: "textarea" },
    ],
  } satisfies CategoryConfig<AwardData>,

  interest: {
    key: "interest",
    label: "Interest",
    sectionHeading: "Interests",
    schema: interestSchema,
    deriveTitle: interestTitle,
    fields: [{ name: "text", label: "Text", kind: "text", required: true }],
  } satisfies CategoryConfig<InterestData>,

  reference: {
    key: "reference",
    label: "Reference",
    sectionHeading: "References",
    schema: referenceSchema,
    deriveTitle: referenceTitle,
    fields: [
      {
        name: "mode",
        label: "Type",
        kind: "select",
        required: true,
        options: [
          { label: "Simple text", value: "simple" },
          { label: "Named reference", value: "detailed" },
        ],
      },
      {
        name: "text",
        label: "Text",
        kind: "text",
        hiddenWhen: { field: "mode", equals: "detailed" },
      },
      {
        name: "name",
        label: "Name",
        kind: "text",
        hiddenWhen: { field: "mode", equals: "simple" },
      },
      {
        name: "relationship",
        label: "Relationship",
        kind: "text",
        hiddenWhen: { field: "mode", equals: "simple" },
      },
      {
        name: "contactDetails",
        label: "Contact details",
        kind: "text",
        hiddenWhen: { field: "mode", equals: "simple" },
      },
    ],
  } satisfies CategoryConfig<ReferenceData>,

  custom: {
    key: "custom",
    label: "Custom",
    sectionHeading: null,
    schema: customSchema,
    deriveTitle: customTitle,
    fields: [
      { name: "sectionTitle", label: "Section title", kind: "text", required: true },
      { name: "heading", label: "Heading", kind: "text", required: true },
      { name: "subheading", label: "Subheading", kind: "text" },
      { name: "date", label: "Date", kind: "date" },
      { name: "bullets", label: "Bullets", kind: "subitems" },
    ],
  } satisfies CategoryConfig<CustomData>,
} as const;

export type CategoryKey = keyof typeof categoryRegistry;

export const categoryKeys = Object.keys(categoryRegistry) as CategoryKey[];

export function getCategoryConfig(key: CategoryKey): CategoryConfig {
  return categoryRegistry[key] as CategoryConfig;
}

export function isCategoryKey(value: string): value is CategoryKey {
  return value in categoryRegistry;
}
