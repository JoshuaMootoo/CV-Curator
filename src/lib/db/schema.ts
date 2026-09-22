import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type SubItem = { id: string; text: string };

export type CvMargins = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type CvItemOverrides = {
  fields: Record<string, unknown>;
  subItems: Record<string, string>;
};

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  tags: text("tags", { mode: "json" }).notNull().$type<string[]>(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const cvs = sqliteTable("cvs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetRole: text("target_role"),
  company: text("company"),
  jobDescription: text("job_description"),
  templateId: text("template_id").notNull(),
  margins: text("margins", { mode: "json" }).$type<CvMargins | null>(),
  sectionOrder: text("section_order", { mode: "json" })
    .notNull()
    .$type<string[]>(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const cvItems = sqliteTable("cv_items", {
  id: text("id").primaryKey(),
  cvId: text("cv_id")
    .notNull()
    .references(() => cvs.id, { onDelete: "cascade" }),
  nodeId: text("node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  position: integer("position").notNull(),
  hiddenSubItemIds: text("hidden_sub_item_ids", { mode: "json" })
    .notNull()
    .$type<string[]>(),
  overrides: text("overrides", { mode: "json" })
    .notNull()
    .$type<CvItemOverrides>(),
});

export type NodeRow = typeof nodes.$inferSelect;
export type NewNodeRow = typeof nodes.$inferInsert;
export type CvRow = typeof cvs.$inferSelect;
export type NewCvRow = typeof cvs.$inferInsert;
export type CvItemRow = typeof cvItems.$inferSelect;
export type NewCvItemRow = typeof cvItems.$inferInsert;
