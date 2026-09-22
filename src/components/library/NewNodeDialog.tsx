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
import { categoryKeys, categoryRegistry, type CategoryKey } from "@/lib/categories/registry";
import { CategoryForm } from "./CategoryForm";
import { createNodeAction } from "@/app/library/actions";

export function NewNodeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryKey | null>(null);

  function close() {
    setOpen(false);
    setCategory(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCategory(null);
      }}
    >
      <DialogTrigger render={<Button>New node</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? `New ${categoryRegistry[category].label} node` : "Choose a category"}
          </DialogTitle>
        </DialogHeader>

        {!category && (
          <div className="grid grid-cols-2 gap-2">
            {categoryKeys.map((key) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => setCategory(key)}
              >
                {categoryRegistry[key].label}
              </Button>
            ))}
          </div>
        )}

        {category && (
          <CategoryForm
            category={category}
            submitLabel="Create"
            onCancel={close}
            onSubmit={async (values) => {
              const result = await createNodeAction({
                category,
                title: values.title,
                data: values.data,
              });
              if (result.success) {
                close();
                router.refresh();
                return { success: true };
              }
              return { success: false, error: result.error };
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
