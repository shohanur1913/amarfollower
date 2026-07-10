"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditEntityDialog, FieldDef } from "@/components/admin/edit-entity-dialog";
import { useAdminCategories } from "@/lib/queries";
import { Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Category {
  id: number;
  name: string;
  platformId: number;
  status: number;
  sortOrder: number;
  platform: { name: string; id: number };
  _count: { services: number };
}

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, refetch } = useAdminCategories();
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 25;
  const paginatedCategories = (categories as Category[]).slice((page - 1) * pageSize, page * pageSize);

  const getCategoryActions = (category: Category): TableAction[] => [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditItem(category); setEditOpen(true); },
    },
    {
      label: category.status === 1 ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: category.id, name: category.name, platformId: category.platformId, status: category.status === 1 ? 0 : 1, sortOrder: category.sortOrder }),
          });
          if (res.ok) { toast.success(category.status === 1 ? "Deactivated" : "Activated"); refetch(); }
          else toast.error("Failed to update");
        } catch { toast.error("Failed to update"); }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Delete category "${category.name}"?`)) return;
        try {
          const res = await fetch(`/api/admin/categories?id=${category.id}`, { method: "DELETE" });
          if (res.ok) { toast.success("Deleted"); refetch(); }
          else { const data = await res.json(); toast.error(data.error || "Failed to delete"); }
        } catch { toast.error("Failed to delete"); }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button>Add Category</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Categories ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : categories.length === 0 ? <p>No categories.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Platform</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-right p-2">Services</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedCategories.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{c.id}</td>
                        <td className="p-2">{c.platform.name}</td>
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2 text-right">{c._count.services}</td>
                        <td className="p-2 text-center">
                          <Badge className={c.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {c.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <TableActions actions={getCategoryActions(c)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={categories.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      {editItem && (
        <EditEntityDialog
          title={`Edit Category — ${editItem.name}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          fields={[
            { name: "name", label: "Name", type: "text", defaultValue: editItem.name, required: true },
            { name: "platformId", label: "Platform ID", type: "number", defaultValue: editItem.platformId, required: true },
            { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: editItem.sortOrder ?? 0 },
            { name: "status", label: "Status", type: "select", defaultValue: editItem.status, options: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] },
          ]}
          onSave={async (data) => {
            const res = await fetch("/api/admin/categories", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: editItem.id, ...data }),
            });
            if (res.ok) { refetch(); return true; }
            return false;
          }}
        />
      )}
    </div>
  );
}
