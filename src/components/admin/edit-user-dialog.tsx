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
  email: string;
  role: string;
  status: string;
  balance: number;
  canOrder: boolean;
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSaved }: EditUserDialogProps) {
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          username: form.get("username"),
          email: form.get("email"),
          role: form.get("role"),
          status: form.get("status"),
          balance: form.get("balance"),
          canOrder: form.get("canOrder") === "on",
          password: form.get("password") || undefined,
        }),
      });

      if (res.ok) {
        toast.success("User updated successfully");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User — {user.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={user.username} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (leave blank to keep)</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" defaultValue={user.role} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={user.status} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ($)</Label>
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue={user.balance} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="canOrder" defaultChecked={user.canOrder} className="rounded" />
                Can Order
              </label>
            </div>
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
