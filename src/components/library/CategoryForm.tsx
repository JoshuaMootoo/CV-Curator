"use client";

import { useState } from "react";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCategoryConfig, type CategoryKey } from "@/lib/categories/registry";
import type { FieldConfig } from "@/lib/categories/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubItemsField } from "./SubItemsField";

export interface CategoryFormSubmitResult {
  success: boolean;
  error?: string;
}

function defaultValuesForFields(fields: FieldConfig[]): FieldValues {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.kind) {
      case "checkbox":
        defaults[field.name] = false;
        break;
      case "subitems":
        defaults[field.name] = [];
        break;
      case "select":
        defaults[field.name] = field.options?.[0]?.value ?? "";
        break;
      default:
        defaults[field.name] = "";
    }
  }
  return defaults;
}

export function CategoryForm({
  category,
  initialTitle = "",
  initialData,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  category: CategoryKey;
  initialTitle?: string;
  initialData?: Record<string, unknown>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: { title: string; data: unknown }) => Promise<CategoryFormSubmitResult>;
}) {
  const config = getCategoryConfig(category);
  const [title, setTitle] = useState(initialTitle);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(config.schema as any),
    defaultValues: initialData ?? defaultValuesForFields(config.fields),
  });

  const watched = watch();

  function isHidden(field: FieldConfig): boolean {
    if (!field.hiddenWhen) return false;
    return watched[field.hiddenWhen.field] === field.hiddenWhen.equals;
  }

  async function submit(data: FieldValues) {
    setSubmitting(true);
    setServerError(null);
    const finalTitle = title.trim() || config.deriveTitle(data as never);
    const result = await onSubmit({ title: finalTitle, data });
    setSubmitting(false);
    if (!result.success) {
      setServerError(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="node-title">Title</Label>
        <div className="flex gap-2">
          <Input
            id="node-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Auto-generated if left blank"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTitle(config.deriveTitle(watched as never))}
          >
            Suggest
          </Button>
        </div>
      </div>

      {config.fields.map((field) => {
        if (isHidden(field)) return null;
        const error = errors[field.name];
        return (
          <div key={field.name} className="space-y-1.5">
            {field.kind !== "checkbox" && (
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
            )}

            {field.kind === "text" && (
              <Input id={field.name} type="text" placeholder={field.placeholder} {...register(field.name)} />
            )}

            {field.kind === "url" && (
              <Input id={field.name} type="url" placeholder={field.placeholder} {...register(field.name)} />
            )}

            {field.kind === "date" && (
              <Input id={field.name} type="month" {...register(field.name)} />
            )}

            {field.kind === "textarea" && (
              <Textarea id={field.name} placeholder={field.placeholder} {...register(field.name)} />
            )}

            {field.kind === "select" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: rhf }) => (
                  <Select value={rhf.value} onValueChange={rhf.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {field.kind === "checkbox" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: rhf }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={!!rhf.value}
                      onCheckedChange={rhf.onChange}
                    />
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                )}
              />
            )}

            {field.kind === "subitems" && (
              <SubItemsField control={control} register={register} name={field.name} label={field.label} />
            )}

            {error && (
              <p className="text-sm text-destructive">
                {typeof error.message === "string" ? error.message : "Invalid value"}
              </p>
            )}
          </div>
        );
      })}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
