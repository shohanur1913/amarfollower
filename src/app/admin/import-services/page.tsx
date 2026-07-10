"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminPlatforms } from "@/lib/queries";
import { toast } from "sonner";
import { Download, CheckCircle, Loader2, Search, RefreshCw, Check, X } from "lucide-react";

interface Provider {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
}

interface ExternalService {
  service: string | number;
  name: string;
  category: string;
  rate: string;
  min: string | number;
  max: string | number;
  platform_id: string;
  importing: boolean;
  imported: boolean;
}

interface SyncResult {
  providerId: number;
  providerName: string;
  created: number;
  updated: number;
  deleted: number;
  total: number;
  error?: string;
}

export default function ImportServicesPage() {
  const { data: platforms = [] } = useAdminPlatforms();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providerId, setProviderId] = useState("");
  const [markup, setMarkup] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [externalServices, setExternalServices] = useState<ExternalService[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [usdRate, setUsdRate] = useState(123);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/import-services")
      .then((r) => r.json())
      .then((data) => { setProviders(data); setLoadingProviders(false); })
      .catch(() => setLoadingProviders(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const rate = data.find((s: { key: string; value: string }) => s.key === "usd_rate");
        if (rate) setUsdRate(parseFloat(rate.value) || 123);
      })
      .catch(() => {});
  }, []);

  const fetchServices = async () => {
    if (!providerId) {
      toast.error("Select a provider first");
      return;
    }
    setLoading(true);
    setExternalServices([]);
    setSelectedIds([]);

    try {
      const res = await fetch(`/api/admin/import-services/fetch?id=${providerId}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const services: ExternalService[] = data.map((s: Record<string, string | number>) => {
          const name = String(s.name || "");
          const category = String(s.category || "");
          const detectedPlat = (platforms as Platform[]).find(
            (p) => name.toLowerCase().includes(p.name.toLowerCase()) || category.toLowerCase().includes(p.name.toLowerCase())
          );
          return {
            service: s.service,
            name,
            category,
            rate: String(s.rate || "0"),
            min: String(s.min || "100"),
            max: String(s.max || "100000"),
            platform_id: detectedPlat ? String(detectedPlat.id) : "",
            importing: false,
            imported: false,
          };
        });
        setExternalServices(services);
        toast.success(`Fetched ${services.length} services`);
      } else {
        toast.error("Invalid response from provider");
      }
    } catch {
      toast.error("Failed to connect to provider API");
    } finally {
      setLoading(false);
    }
  };

  const syncProvider = async () => {
    if (!providerId) {
      toast.error("Select a provider first");
      return;
    }
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch("/api/admin/import-services/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, markup }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResults([data]);
        toast.success(`Sync complete: ${data.created} created, ${data.updated} updated, ${data.deleted} deleted`);
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch("/api/admin/import-services/sync-all", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResults(data.results);
        const s = data.summary;
        toast.success(`Sync complete: ${s.created} created, ${s.updated} updated, ${s.deleted} deleted`);
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  const importService = async (s: ExternalService, isBulk = false): Promise<boolean> => {
    if (!s.platform_id) return false;
    s.importing = true;

    try {
      const res = await fetch("/api/admin/import-services/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          platformId: s.platform_id,
          categoryName: s.category,
          apiServiceId: s.service,
          name: s.name,
          price: ((parseFloat(s.rate) * usdRate) * (1 + markup / 100)).toFixed(2),
          min: s.min,
          max: s.max,
        }),
      });

      if (res.ok) {
        s.imported = true;
        if (!isBulk) toast.success(`Imported #${s.service}`);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      s.importing = false;
    }
  };

  const bulkImport = async () => {
    if (selectedIds.length === 0) return;
    setBulkImporting(true);
    setProgress(0);

    const toImport = externalServices.filter((s) => selectedIds.includes(s.service) && !s.imported);
    for (let i = 0; i < toImport.length; i++) {
      await importService(toImport[i], true);
      setProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    setBulkImporting(false);
    toast.success("Bulk import complete");
    setSelectedIds([]);
  };

  const toggleAll = () => {
    const importable = filteredServices.filter((s) => !s.imported);
    if (selectedIds.length === importable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(importable.map((s) => s.service));
    }
  };

  const calcPrice = (rate: string) => {
    return ((parseFloat(rate) * usdRate) * (1 + markup / 100)).toFixed(2);
  };

  const filteredServices = externalServices.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">API Management</h1>
          <p className="text-xs text-muted-foreground">Bulk Import Engine</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.length} selected</Badge>
              <Button onClick={bulkImport} disabled={bulkImporting} size="sm" className="relative overflow-hidden">
                <span className="relative z-10">{bulkImporting ? "Importing..." : "Bulk Import"}</span>
                {bulkImporting && (
                  <div className="absolute inset-0 bg-black/20 transition-all duration-500" style={{ width: `${progress}%` }} />
                )}
              </Button>
            </div>
          )}
          <Button onClick={syncAll} disabled={syncing} size="sm" variant="outline" className="gap-1">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing All..." : "Sync All Providers"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Source Provider</label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                disabled={loadingProviders}
              >
                <option value="">Choose API...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Markup %</label>
              <Input type="number" value={markup} onChange={(e) => setMarkup(Number(e.target.value))} className="h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Filter</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
            <Button onClick={fetchServices} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Fetch Services
            </Button>
            <Button onClick={syncProvider} disabled={syncing || !providerId} variant="outline" className="w-full">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync Provider
            </Button>
          </div>
        </CardContent>
      </Card>

      {syncResults && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Provider</th>
                  <th className="text-center p-3">Created</th>
                  <th className="text-center p-3">Updated</th>
                  <th className="text-center p-3">Deleted</th>
                  <th className="text-center p-3">Total</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {syncResults.map((r) => (
                  <tr key={r.providerId} className="border-b">
                    <td className="p-3 font-medium">{r.providerName}</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-green-100 text-green-800">{r.created}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-blue-100 text-blue-800">{r.updated}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-red-100 text-red-800">{r.deleted}</Badge>
                    </td>
                    <td className="p-3 text-center">{r.total}</td>
                    <td className="p-3 text-center">
                      {r.error ? (
                        <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 inline mr-1" />{r.error}</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 inline mr-1" />OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-white animate-pulse border rounded-md" />
          ))}
        </div>
      )}

      {!loading && externalServices.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b bg-muted/50 sticky top-0">
                    <th className="p-3 w-10 text-center">
                      <input type="checkbox" checked={selectedIds.length === filteredServices.filter((s) => !s.imported).length && filteredServices.filter((s) => !s.imported).length > 0} onChange={toggleAll} className="rounded" />
                    </th>
                    <th className="text-left p-3">Details</th>
                    <th className="text-left p-3">Price (BDT)</th>
                    <th className="text-left p-3">Platform</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredServices.map((s) => (
                    <tr key={s.service} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition ${s.imported ? "opacity-40" : ""}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.service)}
                          disabled={s.imported}
                          onChange={() => setSelectedIds((prev) => prev.includes(s.service) ? prev.filter((id) => id !== s.service) : [...prev, s.service])}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <span className="text-[9px] font-bold text-primary uppercase">{s.category}</span>
                        <p className="text-xs font-semibold mt-0.5">{s.name}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-bold text-green-600">৳{calcPrice(s.rate)}</span>
                      </td>
                      <td className="p-3">
                        <select
                          value={s.platform_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExternalServices((prev) => prev.map((item) => item.service === s.service ? { ...item, platform_id: val } : item));
                          }}
                          className="bg-muted border rounded-md px-2 py-1 text-xs font-bold outline-none w-32"
                        >
                          <option value="">Choose Platform</option>
                          {(platforms as Platform[]).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => importService(s)}
                          disabled={s.importing || s.imported || !s.platform_id}
                          className="bg-primary/10 text-primary px-4 py-1.5 rounded-md text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition disabled:opacity-50"
                        >
                          {s.imported ? <CheckCircle className="h-3 w-3 inline" /> : s.importing ? <Loader2 className="h-3 w-3 animate-spin inline" /> : "Import"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && externalServices.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filteredServices.length} of {externalServices.length} services
        </p>
      )}
    </div>
  );
}
