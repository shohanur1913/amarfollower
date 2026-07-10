"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditEntityDialog } from "@/components/admin/edit-entity-dialog";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface Role {
  id: number;
  name: string;
  displayName: string;
  permissions: string;
  isDefault: boolean;
  isSystem: boolean;
  _count: { users: number };
}

export default function AdminRolesPage() {
  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => fetchJSON("/api/admin/roles"),
  });

  const [editItem, setEditItem] = useState<Role | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 25;
  const paginatedRoles = (roles as Role[]).slice((page - 1) * pageSize, page * pageSize);

  const parsePermissions = (perms: string): string[] => {
    try { return JSON.parse(perms); } catch { return []; }
  };

  const getRoleActions = (role: Role): TableAction[] => {
    const actions: TableAction[] = [
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: () => { setEditItem(role); setEditOpen(true); },
      },
    ];
    if (!role.isSystem) {
      actions.push({
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: async () => {
          if (!confirm(`Delete role "${role.name}"?`)) return;
          try {
            const res = await fetch(`/api/admin/roles?id=${role.id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Role deleted"); refetch(); }
            else { const data = await res.json(); toast.error(data.error || "Failed to delete"); }
          } catch { toast.error("Failed to delete"); }
        },
        variant: "destructive",
        separator: true,
      });
    }
    return actions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Button><Plus className="h-4 w-4 mr-2" />Add Role</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Roles ({roles.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : roles.length === 0 ? <p>No roles defined.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Display Name</th>
                    <th className="text-center p-2">Users</th>
                    <th className="text-left p-2">Permissions</th>
                    <th className="text-center p-2">Type</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{role.id}</td>
                        <td className="p-2 font-medium">{role.name}</td>
                        <td className="p-2">{role.displayName}</td>
                        <td className="p-2 text-center">{role._count.users}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {parsePermissions(role.permissions).map((perm) => (
                              <Badge key={perm} variant="secondary" className="text-xs">{perm}</Badge>
                            ))}
                            {parsePermissions(role.permissions).length === 0 && <span className="text-muted-foreground text-xs">No permissions</span>}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {role.isSystem ? <Badge className="bg-blue-100 text-blue-800">System</Badge>
                            : role.isDefault ? <Badge className="bg-green-100 text-green-800">Default</Badge>
                            : <Badge variant="secondary">Custom</Badge>}
                        </td>
                        <td className="p-2 text-center">
                          <TableActions actions={getRoleActions(role)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={roles.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      {editItem && (
        <EditEntityDialog
          title={`Edit Role — ${editItem.name}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          fields={[
            { name: "name", label: "Internal Name", type: "text", defaultValue: editItem.name, required: true },
            { name: "displayName", label: "Display Name", type: "text", defaultValue: editItem.displayName, required: true },
            { name: "permissions", label: "Permissions (comma-separated)", type: "text", defaultValue: parsePermissions(editItem.permissions).join(", ") },
          ]}
          onSave={async (data) => {
            const perms = typeof data.permissions === "string"
              ? data.permissions.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [];
            const res = await fetch("/api/admin/roles", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editItem.id, name: data.name, displayName: data.displayName, permissions: perms }),
            });
            if (res.ok) { refetch(); return true; }
            return false;
          }}
        />
      )}
    </div>
  );
}
