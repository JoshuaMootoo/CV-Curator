"use server";

import { revalidatePath } from "next/cache";
import { getCategoryConfig, isCategoryKey } from "@/lib/categories/registry";
import * as queries from "@/lib/db/queries";
import type { NodeRow } from "@/lib/db/schema";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function fail(error: string): { success: false; error: string } {
  return { success: false, error };
}

export async function createNodeAction(input: {
  category: string;
  title: string;
  data: unknown;
}): Promise<ActionResult<NodeRow>> {
  if (!isCategoryKey(input.category)) return fail("Unknown category");
  const config = getCategoryConfig(input.category);
  const parsed = config.schema.safeParse(input.data);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join(", "));

  const title = input.title.trim() || config.deriveTitle(parsed.data as never);
  const node = queries.createNode({
    category: input.category,
    title,
    data: parsed.data,
    tags: [],
  });
  revalidatePath("/library");
  return { success: true, data: node };
}

export async function updateNodeAction(input: {
  id: string;
  category: string;
  title: string;
  data: unknown;
}): Promise<ActionResult<NodeRow>> {
  if (!isCategoryKey(input.category)) return fail("Unknown category");
  const config = getCategoryConfig(input.category);
  const parsed = config.schema.safeParse(input.data);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join(", "));

  const title = input.title.trim() || config.deriveTitle(parsed.data as never);
  const node = queries.updateNode(input.id, {
    category: input.category,
    title,
    data: parsed.data,
  });
  if (!node) return fail("Node not found");
  revalidatePath("/library");
  return { success: true, data: node };
}

export async function duplicateNodeAction(id: string): Promise<ActionResult<NodeRow>> {
  const existing = queries.getNode(id);
  if (!existing) return fail("Node not found");
  if (!isCategoryKey(existing.category)) return fail("Unknown category");

  const node = queries.createNode({
    category: existing.category,
    title: `${existing.title} (Copy)`,
    data: existing.data,
    tags: existing.tags,
  });
  revalidatePath("/library");
  return { success: true, data: node };
}

export async function getNodeCvUsageAction(
  id: string,
): Promise<ActionResult<{ id: string; name: string }[]>> {
  const cvs = queries.listCvsUsingNode(id);
  return { success: true, data: cvs.map((cv) => ({ id: cv.id, name: cv.name })) };
}

export async function deleteNodeAction(id: string): Promise<ActionResult<null>> {
  queries.deleteNode(id);
  revalidatePath("/library");
  return { success: true, data: null };
}
