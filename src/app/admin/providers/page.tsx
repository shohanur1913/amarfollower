"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditEntityDialog } from "@/components/admin/edit-entity-dialog";
import { useAdminProviders } from "@/lib/queries";
import { Pencil, Trash2, Power, Wifi, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Provider {
  id: number;
  name: string;
  apiUrl: string;
  apiKey: string;
  status: number;
  _count: { services: number };
}

interface BalanceState {
  balance: string;
  currency: string;
  loading: boolean;
  error?: string;
}

export default function AdminProvidersPage() {
  const { data: providers = [], isLoading, refetch } = useAdminProviders();
  const [editItem, setEditItem] = useState<Provider | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [balances, setBalances] = useState<Record<number, BalanceState>>({});
  const testedRef = useRef<Set<number>>(new Set());

  const pageSize = 25;
  const paginatedProviders = (providers as Provider[]).slice((page - 1) * pageSize, page * pageSize);

  const testConnection = async (provider: Provider) => {
    setBalances(prev => ({
      ...prev,
      [provider.id]: { balance: "", currency: "", loading: true }
    }));

    try {
      const res = await fetch("/api/admin/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider.id }),
      });
      const data = await res.json();

      if (data.success) {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: data.balance,
            currency: data.currency,
            loading: false,
          }
        }));
      } else {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: "", currency: "", loading: false,
            error: data.error || "Connection failed"
          }
        }));
      }
    } catch {
      setBalances(prev => ({
        ...prev,
        [provider.id]: {
          balance: "", currency: "", loading: false,
          error: "Network error"
        }
      }));
    }
  };

  useEffect(() => {
    if (providers.length > 0) {
      for (const p of providers as Provider[]) {
        if (p.status === 1 && !testedRef.current.has(p.id)) {
          testedRef.current.add(p.id);
          testConnection(p);
        }
      }
    }
  }, [providers]);

  const getProviderActions = (provider: Provider): TableAction[] => [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditItem(provider); setEditOpen(true); },
    },
    {
      label: balances[provider.id]?.loading ? "Testing..." : "Test Connection",
      icon: balances[provider.id]?.loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Wifi className="h-4 w-4" />,
      onClick: () => testConnection(provider),
    },
    {
      label: provider.status === 1 ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/providers", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: provider.id,
              name: provider.name,
              apiUrl: provider.apiUrl,
              apiKey: provider.apiKey,
              status: provider.status === 1 ? 0 : 1,
            }),
          });
          if (res.ok) {
            toast.success(provider.status === 1 ? "Deactivated" : "Activated");
            refetch();
          } else toast.error("Failed to update");
        } catch { toast.error("Failed to update"); }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Delete provider "${provider.name}"?`)) return;
        try {
          const res = await fetch(`/api/admin/providers?id=${provider.id}`, { method: "DELETE" });
          if (res.ok) { toast.success("Deleted"); refetch(); }
          else { const data = await res.json(); toast.error(data.error || "Failed to delete"); }
        } catch { toast.error("Failed to delete"); }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  const formatBalance = (b: BalanceState | undefined) => {
    if (!b) return <span className="text-muted-foreground">—</span>;
    if (b.loading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;
    if (b.error) return (
      <span className="text-red-500 text-[11px]" title={b.error}>
        {b.error}
      </span>
    );
    return <span className="font-medium tabular-nums">{b.currency} {parseFloat(b.balance).toFixed(5)}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Providers</h1>
        <Button>Add Provider</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Providers ({providers.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : providers.length === 0 ? <p>No providers.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">API URL</th>
                    <th className="text-right p-2">Balance</th>
                    <th className="text-right p-2">Services</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedProviders.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{p.id}</td>
                        <td className="p-2 font-medium">{p.name}</td>
                        <td className="p-2 truncate max-w-[180px]">{p.apiUrl}</td>
                        <td className="p-2 text-right">{formatBalance(balances[p.id])}</td>
                        <td className="p-2 text-right">{p._count.services}</td>
                        <td className="p-2 text-center">
                          <Badge className={p.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {p.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <TableActions actions={getProviderActions(p)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={providers.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      {editItem && (
        <EditEntityDialog
          title={`Edit Provider — ${editItem.name}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          fields={[
            { name: "name", label: "Name", type: "text", defaultValue: editItem.name, required: true },
            { name: "apiUrl", label: "API URL", type: "text", defaultValue: editItem.apiUrl, required: true },
            { name: "apiKey", label: "API Key", type: "text", defaultValue: editItem.apiKey, required: true },
            { name: "status", label: "Status", type: "select", defaultValue: editItem.status, options: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] },
          ]}
          onSave={async (data) => {
            const res = await fetch("/api/admin/providers", {
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
