"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { categoryRegistry, isCategoryKey } from "@/lib/categories/registry";
import { CategoryForm } from "./CategoryForm";
import { updateNodeAction } from "@/app/library/actions";
import type { NodeRow } from "@/lib/db/schema";
import { Pencil } from "lucide-react";

export function EditNodeDialog({ node }: { node: NodeRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isCategoryKey(node.category)) return null;
  const category = node.category;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-3.5" /> Edit
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {categoryRegistry[category].label} node</DialogTitle>
        </DialogHeader>

        <CategoryForm
          category={category}
          initialTitle={node.title}
          initialData={node.data as Record<string, unknown>}
          submitLabel="Save"
          onCancel={() => setOpen(false)}
          onSubmit={async (values) => {
            const result = await updateNodeAction({
              id: node.id,
              category,
              title: values.title,
              data: values.data,
            });
            if (result.success) {
              setOpen(false);
              router.refresh();
              return { success: true };
            }
            return { success: false, error: result.error };
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
