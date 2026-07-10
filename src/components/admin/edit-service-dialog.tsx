"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
  categoryId: number;
  providerId: number | null;
  pricePerK: number;
  min: number;
  max: number;
  status: number;
  description?: string;
}

interface EditServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditServiceDialog({ service, open, onOpenChange, onSaved }: EditServiceDialogProps) {
  const [saving, setSaving] = useState(false);

  if (!service) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          name: form.get("name"),
          categoryId: form.get("categoryId"),
          providerId: form.get("providerId") || null,
          pricePerK: form.get("pricePerK"),
          min: form.get("min"),
          max: form.get("max"),
          status: form.get("status"),
          description: form.get("description"),
        }),
      });

      if (res.ok) {
        toast.success("Service updated successfully");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error("Failed to update service");
      }
    } catch {
      toast.error("Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Service — {service.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" name="name" defaultValue={service.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID</Label>
              <Input id="categoryId" name="categoryId" type="number" defaultValue={service.categoryId} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerId">Provider ID</Label>
              <Input id="providerId" name="providerId" type="number" defaultValue={service.providerId ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerK">Price / 1k</Label>
              <Input id="pricePerK" name="pricePerK" type="number" step="0.01" defaultValue={service.pricePerK} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Min</Label>
              <Input id="min" name="min" type="number" defaultValue={service.min} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max</Label>
              <Input id="max" name="max" type="number" defaultValue={service.max} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={service.status} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" defaultValue={service.description || ""} rows={3} className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
