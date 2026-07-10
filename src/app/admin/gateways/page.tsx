"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditEntityDialog } from "@/components/admin/edit-entity-dialog";
import { useAdminGateways } from "@/lib/queries";
import { Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Gateway {
  id: number;
  name: string;
  displayName: string;
  apiKey: string;
  baseUrl: string;
  currency: string;
  status: number;
}

export default function AdminGatewaysPage() {
  const { data: gateways = [], isLoading, refetch } = useAdminGateways();
  const [editItem, setEditItem] = useState<Gateway | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 25;
  const paginatedGateways = (gateways as Gateway[]).slice((page - 1) * pageSize, page * pageSize);

  const getGatewayActions = (gateway: Gateway): TableAction[] => [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditItem(gateway); setEditOpen(true); },
    },
    {
      label: gateway.status === 1 ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/gateways", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: gateway.id, name: gateway.name, displayName: gateway.displayName, apiKey: gateway.apiKey, baseUrl: gateway.baseUrl, currency: gateway.currency, status: gateway.status === 1 ? 0 : 1 }),
          });
          if (res.ok) { toast.success(gateway.status === 1 ? "Deactivated" : "Activated"); refetch(); }
          else toast.error("Failed to update");
        } catch { toast.error("Failed to update"); }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Delete gateway "${gateway.name}"?`)) return;
        try {
          const res = await fetch(`/api/admin/gateways?id=${gateway.id}`, { method: "DELETE" });
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
      <h1 className="text-2xl font-bold">Payment Gateways</h1>
      <Card>
        <CardHeader><CardTitle>All Gateways ({gateways.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : gateways.length === 0 ? <p>No gateways.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Display</th>
                    <th className="text-left p-2">Currency</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedGateways.map((g) => (
                      <tr key={g.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{g.id}</td>
                        <td className="p-2 font-medium">{g.name}</td>
                        <td className="p-2">{g.displayName}</td>
                        <td className="p-2">{g.currency}</td>
                        <td className="p-2 text-center">
                          <Badge className={g.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {g.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <TableActions actions={getGatewayActions(g)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={gateways.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      {editItem && (
        <EditEntityDialog
          title={`Edit Gateway — ${editItem.name}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          fields={[
            { name: "name", label: "Internal Name", type: "text", defaultValue: editItem.name, required: true },
            { name: "displayName", label: "Display Name", type: "text", defaultValue: editItem.displayName, required: true },
            { name: "apiKey", label: "API Key / Payment Key", type: "text", defaultValue: editItem.apiKey, required: true },
            { name: "baseUrl", label: "Base URL / Merchant ID", type: "text", defaultValue: editItem.baseUrl, required: true },
            { name: "currency", label: "Currency", type: "text", defaultValue: editItem.currency, required: true },
            { name: "status", label: "Status", type: "select", defaultValue: editItem.status, options: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] },
          ]}
          onSave={async (data) => {
            const res = await fetch("/api/admin/gateways", {
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
