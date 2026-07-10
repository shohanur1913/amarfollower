"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditServiceDialog } from "@/components/admin/edit-service-dialog";
import { useAdminServices, useAdminProviders } from "@/lib/queries";
import { Pencil, Trash2, Power, Upload, Plus, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Service {
  id: number;
  name: string;
  categoryId: number;
  providerId: number | null;
  category: { name: string; platform: { name: string } };
  provider: { name: string } | null;
  pricePerK: number;
  min: number;
  max: number;
  status: number;
  description?: string;
}

export default function AdminServicesPage() {
  const { data: services = [], isLoading, refetch } = useAdminServices();
  const { data: providers = [] } = useAdminProviders();
  const [editService, setEditService] = useState<Service | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [provFilter, setProvFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  const filtered = (services as Service[]).filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toString().includes(search);
    const matchProv = !provFilter || String(s.providerId) === provFilter;
    return matchSearch && matchProv;
  });

  const pageSize = 25;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [search, provFilter]);

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected services?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    }
    toast.success(`Deleted ${selectedIds.length} services`);
    setSelectedIds([]);
    refetch();
  };

  const syncAll = async () => {
    if (!confirm("Sync all active providers? This will create new, update existing, and delete removed services.")) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/import-services/sync-all", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        const { summary, results } = data;
        const errors = results.filter((r: { error?: string }) => r.error);
        toast.success(
          `Sync complete: ${summary.created} created, ${summary.updated} updated, ${summary.deleted} deleted` +
          (errors.length > 0 ? ` (${errors.length} provider errors)` : "")
        );
        refetch();
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  const getServiceActions = (service: Service): TableAction[] => [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditService(service); setEditOpen(true); },
    },
    {
      label: service.status === 1 ? "Deactivate" : "Activate",
      icon: <Power className="h-4 w-4" />,
      onClick: async () => {
        try {
          const res = await fetch("/api/admin/services", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: service.id, name: service.name, categoryId: service.categoryId,
              providerId: service.providerId, pricePerK: service.pricePerK,
              min: service.min, max: service.max, status: service.status === 1 ? 0 : 1,
              description: service.description,
            }),
          });
          if (res.ok) { toast.success(service.status === 1 ? "Deactivated" : "Activated"); refetch(); }
          else toast.error("Failed to update");
        } catch { toast.error("Failed to update"); }
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Delete service "${service.name}"?`)) return;
        try {
          const res = await fetch(`/api/admin/services?id=${service.id}`, { method: "DELETE" });
          if (res.ok) { toast.success("Deleted"); refetch(); }
          else toast.error("Failed to delete");
        } catch { toast.error("Failed to delete"); }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48 sm:w-56 h-9 text-sm"
            />
          </div>
          <select
            value={provFilter}
            onChange={(e) => setProvFilter(e.target.value)}
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">All Providers</option>
            {(providers as { id: number; name: string }[]).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={bulkDelete} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Link href="/admin/import-services">
            <Button variant="outline" size="sm" className="gap-1">
              <Upload className="h-3.5 w-3.5" />
              Import API
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1" onClick={syncAll} disabled={syncing}>
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync All"}
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            New Service
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Services ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No services found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-muted/50 sticky top-0">
                      <th className="p-2 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filtered.length && filtered.length > 0}
                          onChange={toggleAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Platform</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Service</th>
                      <th className="text-left p-2">Provider</th>
                      <th className="text-right p-2">Price/1k</th>
                      <th className="text-right p-2">Min</th>
                      <th className="text-right p-2">Max</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={() => setSelectedIds((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                            className="rounded"
                          />
                        </td>
                        <td className="p-2 font-mono text-gray-400">#{s.id}</td>
                        <td className="p-2">
                          <span className="text-[9px] font-bold text-primary uppercase">{s.category.platform.name}</span>
                        </td>
                        <td className="p-2">{s.category.name}</td>
                        <td className="p-2 font-medium max-w-[200px] truncate">{s.name}</td>
                        <td className="p-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                            {s.provider?.name || "Manual"}
                          </span>
                        </td>
                        <td className="p-2 text-right font-bold">৳{Number(s.pricePerK).toFixed(2)}</td>
                        <td className="p-2 text-right">{s.min}</td>
                        <td className="p-2 text-right">{s.max}</td>
                        <td className="p-2 text-center">
                          <Badge className={s.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {s.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <TableActions actions={getServiceActions(s)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      <EditServiceDialog service={editService} open={editOpen} onOpenChange={setEditOpen} onSaved={() => refetch()} />
    </div>
  );
}
