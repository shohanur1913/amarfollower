"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  balance: number;
}

interface CreditAdjustDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function CreditAdjustDialog({ user, open, onOpenChange, onSaved }: CreditAdjustDialogProps) {
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add" | "deduct">("add");

  if (!user) return null;

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid positive amount");
      return;
    }

    setSaving(true);
    try {
      const finalAmount = type === "deduct" ? -numericAmount : numericAmount;
      const res = await fetch("/api/admin/users/balance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount: finalAmount }),
      });

      if (res.ok) {
        toast.success(type === "add" ? `Added ৳${numericAmount.toFixed(2)}` : `Deducted ৳${numericAmount.toFixed(2)}`);
        onOpenChange(false);
        onSaved();
      } else {
        toast.error("Failed to adjust credit");
      }
    } catch {
      toast.error("Failed to adjust credit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Credit — {user.username}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current balance: <span className="font-medium text-foreground">৳{Number(user.balance).toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "add" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("add")}
            >
              Add
            </Button>
            <Button
              type="button"
              variant={type === "deduct" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("deduct")}
            >
              Deduct
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
            <div className="text-sm text-muted-foreground">
              New balance will be: <span className="font-medium text-foreground">
                ৳{(type === "add" ? user.balance + parseFloat(amount) : user.balance - parseFloat(amount)).toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !amount || parseFloat(amount) <= 0}>
            {saving ? "Saving..." : type === "add" ? "Add Credit" : "Deduct Credit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
