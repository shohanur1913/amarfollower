"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: { label: string; value: string | number }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
}

interface EditEntityDialogProps {
  title: string;
  fields: FieldDef[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Record<string, string | number | null>) => Promise<boolean>;
}

export function EditEntityDialog({ title, fields, open, onOpenChange, onSave }: EditEntityDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const data: Record<string, string | number | null> = {};

    for (const field of fields) {
      const val = form.get(field.name);
      if (field.type === "number") {
        data[field.name] = val !== null && val !== "" ? Number(val) : null;
      } else {
        data[field.name] = val !== null ? String(val) : null;
      }
    }

    const ok = await onSave(data);
    setSaving(false);
    if (ok) {
      toast.success("Saved successfully");
      onOpenChange(false);
    } else {
      toast.error("Failed to save");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  defaultValue={field.defaultValue ?? ""}
                  rows={3}
                  placeholder={field.placeholder}
                  className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  defaultValue={field.defaultValue ?? ""}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                >
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  defaultValue={field.defaultValue ?? ""}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
