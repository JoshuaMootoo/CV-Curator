import { randomUUID } from "node:crypto";
import { sqlite } from "./client";
import { createNode, createCv, createCvItem } from "./queries";
import type { NodeRow } from "./schema";

function sub(text: string) {
  return { id: randomUUID(), text };
}

function seed() {
  sqlite.exec("DELETE FROM cv_items; DELETE FROM cvs; DELETE FROM nodes;");

  const header = createNode({
    category: "header",
    title: "Header",
    data: { fullName: "Jordan Ellis", headline: "Full-Stack Developer" },
  });

  const email = createNode({
    category: "contact",
    title: "email: jordan.ellis@example.com",
    data: { type: "email", value: "jordan.ellis@example.com" },
  });

  const phone = createNode({
    category: "contact",
    title: "phone: +44 7700 900123",
    data: { type: "phone", value: "+44 7700 900123" },
  });

  const linkedin = createNode({
    category: "contact",
    title: "LinkedIn",
    data: {
      type: "linkedin",
      value: "https://linkedin.com/in/jordanellis",
      label: "linkedin.com/in/jordanellis",
    },
  });

  const statement = createNode({
    category: "statement",
    title: "Personal Statement",
    data: {
      title: "Personal Statement",
      text:
        "Full-stack developer with a track record of shipping reliable web products, " +
        "from database design through to polished, accessible UI.",
    },
  });

  const experience = createNode({
    category: "experience",
    title: "Software Developer, Acme Ltd",
    data: {
      role: "Software Developer",
      organisation: "Acme Ltd",
      location: "London, UK",
      startDate: "2021-06",
      endDate: undefined,
      isCurrent: true,
      bullets: [
        sub("Led the rebuild of the customer portal, cutting page load time by 40%."),
        sub("Designed and shipped a REST API used by three internal teams."),
        sub("Mentored two junior developers through structured code review."),
        sub("Introduced automated end-to-end testing, reducing regression bugs by half."),
      ],
    },
  });

  const education = createNode({
    category: "education",
    title: "BSc Computer Science, University of Leeds",
    data: {
      institution: "University of Leeds",
      qualification: "BSc Computer Science",
      grade: "First Class Honours",
      location: "Leeds, UK",
      startDate: "2017-09",
      endDate: "2020-07",
      isCurrent: false,
      highlights: [
        sub("Dissertation on distributed systems awarded the department prize."),
        sub("Teaching assistant for first-year programming modules."),
      ],
    },
  });

  const skillLanguages = createNode({
    category: "skill",
    title: "TypeScript (Languages)",
    data: { name: "TypeScript", group: "Languages" },
  });

  const skillTools = createNode({
    category: "skill",
    title: "Docker (Tools)",
    data: { name: "Docker", group: "Tools" },
  });

  const project = createNode({
    category: "project",
    title: "CV Curator",
    data: {
      name: "CV Curator",
      subtitle: "Next.js, TypeScript, SQLite",
      link: "https://github.com/jordanellis/cv-curator",
      startDate: "2024-01",
      endDate: undefined,
      bullets: [
        sub("Built a drag-and-drop CV builder that exports real Word documents."),
        sub("Implemented a reusable node library backed by SQLite and Drizzle ORM."),
      ],
    },
  });

  const certification = createNode({
    category: "certification",
    title: "AWS Certified Developer, Amazon Web Services",
    data: {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2022-03",
      link: "https://aws.amazon.com/certification/",
    },
  });

  const award = createNode({
    category: "award",
    title: "Graduate of the Year, Acme Ltd",
    data: {
      name: "Graduate of the Year",
      issuer: "Acme Ltd",
      date: "2022-01",
      description: "Awarded for outstanding contribution in the first year on the graduate scheme.",
    },
  });

  const interest = createNode({
    category: "interest",
    title: "Rock climbing, cycling, chess",
    data: { text: "Rock climbing, cycling, chess" },
  });

  const reference = createNode({
    category: "reference",
    title: "Available on request",
    data: { mode: "simple", text: "Available on request" },
  });

  const custom = createNode({
    category: "custom",
    title: "Conference Talk (Extra)",
    data: {
      sectionTitle: "Extra",
      heading: "Conference Talk",
      subheading: "LondonJS Meetup",
      date: "2023-11",
      bullets: [sub("Spoke on building accessible drag-and-drop interfaces.")],
    },
  });

  const nodesForCv: { node: NodeRow; section: string }[] = [
    { node: header, section: "header" },
    { node: email, section: "contact" },
    { node: phone, section: "contact" },
    { node: linkedin, section: "contact" },
    { node: statement, section: "statement" },
    { node: experience, section: "experience" },
    { node: education, section: "education" },
    { node: skillLanguages, section: "skill" },
    { node: skillTools, section: "skill" },
    { node: project, section: "project" },
    { node: certification, section: "certification" },
    { node: award, section: "award" },
    { node: interest, section: "interest" },
    { node: reference, section: "reference" },
  ];

  const cv = createCv({
    name: "Software Developer, Acme Ltd",
    targetRole: "Software Developer",
    company: "Acme Ltd",
    templateId: "classic",
    sectionOrder: [
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
    ],
  });

  const positionBySection = new Map<string, number>();
  for (const { node, section } of nodesForCv) {
    const position = positionBySection.get(section) ?? 0;
    createCvItem({ cvId: cv.id, nodeId: node.id, section, position });
    positionBySection.set(section, position + 1);
  }

  console.log(
    `Seeded ${nodesForCv.length + 1} nodes (including "${custom.title}", not placed on the seed CV) and 1 CV.`,
  );
}

seed();
sqlite.close();
