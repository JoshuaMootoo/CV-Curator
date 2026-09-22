import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

let dbPath: string;
let sqlite: import("better-sqlite3").Database;
let queries: typeof import("@/lib/db/queries");

beforeAll(async () => {
  dbPath = path.join(
    os.tmpdir(),
    `cv-curator-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  process.env.CV_DB_PATH = dbPath;

  const client = await import("@/lib/db/client");
  sqlite = client.sqlite;
  migrate(client.db, {
    migrationsFolder: path.join(process.cwd(), "src/lib/db/migrations"),
  });

  queries = await import("@/lib/db/queries");
});

afterAll(() => {
  sqlite.close();
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(`${dbPath}${suffix}`, { force: true });
  }
});

describe("node queries", () => {
  it("creates, reads, updates and deletes a node", () => {
    const node = queries.createNode({
      category: "skill",
      title: "TypeScript (Languages)",
      data: { name: "TypeScript", group: "Languages" },
      tags: ["dev"],
    });

    expect(node.id).toBeTruthy();
    expect(queries.getNode(node.id)).toMatchObject({ title: "TypeScript (Languages)" });
    expect(queries.listNodes().map((n) => n.id)).toContain(node.id);

    const updated = queries.updateNode(node.id, { title: "TS (Languages)" });
    expect(updated?.title).toBe("TS (Languages)");
    expect(updated?.updatedAt).toBeGreaterThanOrEqual(node.updatedAt);

    queries.deleteNode(node.id);
    expect(queries.getNode(node.id)).toBeUndefined();
  });
});

describe("cv and cv_item queries", () => {
  it("creates a cv with items and cascades deletes", () => {
    const node = queries.createNode({
      category: "skill",
      title: "Docker (Tools)",
      data: { name: "Docker", group: "Tools" },
    });

    const cv = queries.createCv({
      name: "Test CV",
      templateId: "classic",
      sectionOrder: ["skill"],
    });

    const item = queries.createCvItem({
      cvId: cv.id,
      nodeId: node.id,
      section: "skill",
      position: 0,
    });

    expect(queries.listCvItemsForCv(cv.id)).toHaveLength(1);

    const updatedItem = queries.updateCvItem(item.id, {
      hiddenSubItemIds: ["abc"],
    });
    expect(updatedItem?.hiddenSubItemIds).toEqual(["abc"]);

    queries.deleteCv(cv.id);
    expect(queries.listCvItemsForCv(cv.id)).toHaveLength(0);
    expect(queries.getCvItem(item.id)).toBeUndefined();
  });

  it("cascades cv_item deletion when the node is deleted", () => {
    const node = queries.createNode({
      category: "skill",
      title: "SQL (Languages)",
      data: { name: "SQL", group: "Languages" },
    });
    const cv = queries.createCv({
      name: "Another CV",
      templateId: "classic",
      sectionOrder: ["skill"],
    });
    const item = queries.createCvItem({
      cvId: cv.id,
      nodeId: node.id,
      section: "skill",
      position: 0,
    });

    queries.deleteNode(node.id);
    expect(queries.getCvItem(item.id)).toBeUndefined();
  });
});
