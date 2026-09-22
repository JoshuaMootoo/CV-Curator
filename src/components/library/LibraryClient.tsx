"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryKeys, categoryRegistry, isCategoryKey } from "@/lib/categories/registry";
import type { NodeRow } from "@/lib/db/schema";
import { NodeCard } from "./NodeCard";
import { NewNodeDialog } from "./NewNodeDialog";

const ALL_CATEGORIES = "all";

export function LibraryClient({ nodes }: { nodes: NodeRow[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return nodes.filter((node) => {
      if (category !== ALL_CATEGORIES && node.category !== category) return false;
      if (!query) return true;
      const summary = isCategoryKey(node.category)
        ? categoryRegistry[node.category].deriveSummary(node.data as never)
        : "";
      return (
        node.title.toLowerCase().includes(query) || summary.toLowerCase().includes(query)
      );
    });
  }, [nodes, search, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nodes..."
          className="max-w-xs"
        />
        <Select value={category} onValueChange={(value) => setCategory(value ?? ALL_CATEGORIES)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {categoryKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {categoryRegistry[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <NewNodeDialog />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {nodes.length === 0 ? "No nodes yet. Create your first one." : "No nodes match your filters."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
