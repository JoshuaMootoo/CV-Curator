import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  nodes,
  cvs,
  cvItems,
  type NodeRow,
  type CvRow,
  type CvItemRow,
  type CvMargins,
  type CvItemOverrides,
} from "./schema";
import type { CategoryKey } from "../categories/registry";

export function createNode(input: {
  category: CategoryKey;
  title: string;
  data: unknown;
  tags?: string[];
}): NodeRow {
  const now = Date.now();
  const row = {
    id: randomUUID(),
    category: input.category,
    title: input.title,
    data: input.data,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  db.insert(nodes).values(row).run();
  return getNode(row.id)!;
}

export function getNode(id: string): NodeRow | undefined {
  return db.select().from(nodes).where(eq(nodes.id, id)).get();
}

export function listNodes(): NodeRow[] {
  return db.select().from(nodes).all();
}

export function updateNode(
  id: string,
  input: Partial<{ category: CategoryKey; title: string; data: unknown; tags: string[] }>,
): NodeRow | undefined {
  db
    .update(nodes)
    .set({ ...input, updatedAt: Date.now() })
    .where(eq(nodes.id, id))
    .run();
  return getNode(id);
}

export function deleteNode(id: string): void {
  db.delete(nodes).where(eq(nodes.id, id)).run();
}

/** CVs that currently place this node, for the "used in CVs" delete warning. */
export function listCvsUsingNode(nodeId: string): CvRow[] {
  return db
    .select({ cv: cvs })
    .from(cvItems)
    .innerJoin(cvs, eq(cvItems.cvId, cvs.id))
    .where(eq(cvItems.nodeId, nodeId))
    .all()
    .map((row) => row.cv);
}

export function createCv(input: {
  name: string;
  targetRole?: string;
  company?: string;
  jobDescription?: string;
  templateId: string;
  margins?: CvMargins | null;
  sectionOrder?: string[];
}): CvRow {
  const now = Date.now();
  const row = {
    id: randomUUID(),
    name: input.name,
    targetRole: input.targetRole ?? null,
    company: input.company ?? null,
    jobDescription: input.jobDescription ?? null,
    templateId: input.templateId,
    margins: input.margins ?? null,
    sectionOrder: input.sectionOrder ?? [],
    createdAt: now,
    updatedAt: now,
  };
  db.insert(cvs).values(row).run();
  return getCv(row.id)!;
}

export function getCv(id: string): CvRow | undefined {
  return db.select().from(cvs).where(eq(cvs.id, id)).get();
}

export function listCvs(): CvRow[] {
  return db.select().from(cvs).all();
}

export function updateCv(
  id: string,
  input: Partial<{
    name: string;
    targetRole: string | null;
    company: string | null;
    jobDescription: string | null;
    templateId: string;
    margins: CvMargins | null;
    sectionOrder: string[];
  }>,
): CvRow | undefined {
  db
    .update(cvs)
    .set({ ...input, updatedAt: Date.now() })
    .where(eq(cvs.id, id))
    .run();
  return getCv(id);
}

export function deleteCv(id: string): void {
  db.delete(cvs).where(eq(cvs.id, id)).run();
}

export function createCvItem(input: {
  cvId: string;
  nodeId: string;
  section: string;
  position: number;
  hiddenSubItemIds?: string[];
  overrides?: CvItemOverrides;
}): CvItemRow {
  const row = {
    id: randomUUID(),
    cvId: input.cvId,
    nodeId: input.nodeId,
    section: input.section,
    position: input.position,
    hiddenSubItemIds: input.hiddenSubItemIds ?? [],
    overrides: input.overrides ?? { fields: {}, subItems: {} },
  };
  db.insert(cvItems).values(row).run();
  return getCvItem(row.id)!;
}

export function getCvItem(id: string): CvItemRow | undefined {
  return db.select().from(cvItems).where(eq(cvItems.id, id)).get();
}

export function listCvItemsForCv(cvId: string): CvItemRow[] {
  return db.select().from(cvItems).where(eq(cvItems.cvId, cvId)).all();
}

export function updateCvItem(
  id: string,
  input: Partial<{
    section: string;
    position: number;
    hiddenSubItemIds: string[];
    overrides: CvItemOverrides;
  }>,
): CvItemRow | undefined {
  db.update(cvItems).set(input).where(eq(cvItems.id, id)).run();
  return getCvItem(id);
}

export function deleteCvItem(id: string): void {
  db.delete(cvItems).where(eq(cvItems.id, id)).run();
}
