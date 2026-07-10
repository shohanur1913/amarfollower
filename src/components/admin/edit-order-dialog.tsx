"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Order {
  id: number;
  user: { username: string; email: string };
  service: { name: string };
  link: string;
  quantity: number;
  charge: number;
  status: string;
  createdAt: string;
}

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const STATUS_OPTIONS = ["pending", "processing", "in_progress", "completed", "cancelled", "refunded"];

const statusColor = (s: string) => {
  switch (s) {
    case "completed": return "bg-green-100 text-green-800";
    case "processing":
    case "in_progress": return "bg-blue-100 text-blue-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "refunded": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function EditOrderDialog({ order, open, onOpenChange, onSaved }: EditOrderDialogProps) {
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || "");

  if (!order) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">User:</span>
            <span className="font-medium">{order.user.username}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{order.service.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Link:</span>
            <span className="font-medium truncate">{order.link}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">{order.quantity}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Charge:</span>
            <span className="font-medium">৳{Number(order.charge).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <span className="text-muted-foreground">Current Status:</span>
            <Badge className={statusColor(order.status)}>{order.status}</Badge>
          </div>
          <div className="pt-2 border-t space-y-2">
            <Label>Change Status</Label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || newStatus === order.status}>
            {saving ? "Saving..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
