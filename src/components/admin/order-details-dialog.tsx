"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

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
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{order.user.email}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{order.service.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Link:</span>
            <span className="font-medium break-all">{order.link}</span>
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
            <span className="text-muted-foreground">Status:</span>
            <Badge className={statusColor(order.status)}>{order.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
