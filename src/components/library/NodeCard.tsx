"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryRegistry, isCategoryKey } from "@/lib/categories/registry";
import type { NodeRow } from "@/lib/db/schema";
import { EditNodeDialog } from "./EditNodeDialog";
import { DeleteNodeDialog } from "./DeleteNodeDialog";
import { duplicateNodeAction } from "@/app/library/actions";
import { Copy } from "lucide-react";

export function NodeCard({ node }: { node: NodeRow }) {
  const router = useRouter();
  const [duplicating, setDuplicating] = useState(false);

  const categoryLabel = isCategoryKey(node.category)
    ? categoryRegistry[node.category].label
    : node.category;

  const summary = isCategoryKey(node.category)
    ? categoryRegistry[node.category].deriveSummary(node.data as never)
    : "";

  async function handleDuplicate() {
    setDuplicating(true);
    await duplicateNodeAction(node.id);
    setDuplicating(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-1.5">
            {categoryLabel}
          </Badge>
          <h3 className="truncate font-medium leading-tight">{node.title}</h3>
          {summary && <p className="truncate text-sm text-muted-foreground">{summary}</p>}
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <EditNodeDialog node={node} />
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicating}>
          <Copy className="size-3.5" /> {duplicating ? "Duplicating..." : "Duplicate"}
        </Button>
        <DeleteNodeDialog nodeId={node.id} nodeTitle={node.title} />
      </CardContent>
    </Card>
  );
}
