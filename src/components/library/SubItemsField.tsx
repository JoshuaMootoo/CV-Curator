"use client";

import {
  useFieldArray,
  type Control,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export function SubItemsField({
  control,
  register,
  name,
  label,
}: {
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  name: string;
  label: string;
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ id: crypto.randomUUID(), text: "" })}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">None yet.</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-1.5">
            <div className="flex flex-col">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Move up"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Move down"
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
            <Input
              {...register(`${name}.${index}.text`)}
              placeholder="Bullet text"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(index)}
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
