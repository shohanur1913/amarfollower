"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { CreditAdjustDialog } from "@/components/admin/credit-adjust-dialog";
import { useAdminUsers } from "@/lib/queries";
import { Pencil, Trash2, LogIn, Eye, Ban, Wallet, Search } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  canOrder: boolean;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading, refetch } = useAdminUsers(
    useMemo(() => {
      const params: { search?: string; status?: string; role?: string } = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;
      return params;
    }, [search, statusFilter, roleFilter]),
  );

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [creditUser, setCreditUser] = useState<User | null>(null);
  const [creditOpen, setCreditOpen] = useState(false);
  const initialPage = parseInt(searchParams.get("page") || "1");
  const [page, setPage] = useState(initialPage);

  const pageSize = 25;
  const paginatedUsers = (users as User[]).slice((page - 1) * pageSize, page * pageSize);

  const getUserActions = (user: User): TableAction[] => [
    {
      label: "Login as User",
      icon: <LogIn className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/login-as-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          });
          if (res.ok) {
            toast.success(`Logged in as ${user.username}`);
            router.push("/dashboard");
          } else {
            toast.error("Failed to login as user");
          }
        } catch {
          toast.error("Failed to login as user");
        }
      },
    },
    {
      label: "View Orders",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => router.push(`/admin/orders?user=${user.id}`),
    },
    {
      label: "Adjust Credit",
      icon: <Wallet className="h-4 w-4" />,
      onClick: () => { setCreditUser(user); setCreditOpen(true); },
    },
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditUser(user); setEditOpen(true); },
    },
    {
      label: user.status === "banned" ? "Unban" : "Ban",
      icon: <Ban className="h-4 w-4" />,
      onClick: async () => {
        const newStatus = user.status === "banned" ? "active" : "banned";
        if (newStatus === "banned" && !confirm(`Ban user "${user.username}"?`)) return;
        try {
          const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, status: newStatus }),
          });
          if (res.ok) {
            toast.success(newStatus === "banned" ? "User banned" : "User unbanned");
            refetch();
          } else {
            toast.error("Failed to update user");
          }
        } catch {
          toast.error("Failed to update user");
        }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
        try {
          const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
          if (res.ok) {
            toast.success("User deleted");
            refetch();
          } else {
            toast.error("Failed to delete user");
          }
        } catch {
          toast.error("Failed to delete user");
        }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button>Add User</Button>
      </div>
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search username or email..."
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <select
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
      <Card>
        <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : users.length === 0 ? <p>No users.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-center p-2">Role</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-right p-2">Balance</th>
                    <th className="text-right p-2">Orders</th>
                    <th className="text-left p-2">Joined</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{u.id}</td>
                        <td className="p-2 font-medium">{u.username}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2 text-center"><Badge>{u.role}</Badge></td>
                        <td className="p-2 text-center">
                          <Badge className={u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">৳{Number(u.balance).toFixed(2)}</td>
                        <td className="p-2 text-right">{u._count.orders}</td>
                        <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          <TableActions actions={getUserActions(u)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={users.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      <EditUserDialog user={editUser} open={editOpen} onOpenChange={setEditOpen} onSaved={() => refetch()} />
      <CreditAdjustDialog user={creditUser} open={creditOpen} onOpenChange={setCreditOpen} onSaved={() => refetch()} />
    </div>
  );
}
