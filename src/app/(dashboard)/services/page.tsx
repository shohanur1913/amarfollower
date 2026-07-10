"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Service {
  id: number;
  name: string;
  category: { name: string; platform: { name: string } };
  min: number;
  max: number;
  pricePerK: number;
  perAmount: number;
}

interface PaginatedResponse {
  data: Service[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="p-2"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/services?page=${page}&pageSize=${pageSize}`);
        const json = (await res.json()) as PaginatedResponse;
        if (res.ok) {
          setServices(json.data || []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
          setPlatforms(Array.from(new Set((json.data || []).map((s) => s.category.platform.name))));
          setCategories(Array.from(new Set((json.data || []).map((s) => s.category.name))));
        } else {
          setError("Failed to load services");
        }
      } catch {
        setError("Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [page, pageSize]);

  const filtered = services.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.id).includes(search);
    const matchesPlatform =
      platformFilter === "all" ||
      s.category.platform.name.toLowerCase() === platformFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "all" ||
      s.category.name.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Services</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Input
              className="max-w-xs"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={platformFilter} onValueChange={(v) => v && setPlatformFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(v === "all" ? "all" : Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
          )}

          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["ID","Platform","Category","Service","Min","Max","Price/1k"].map((h) => (
                    <th key={h} className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[1,2,3,4,5].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No services available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Platform</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Service</th>
                    <th className="text-right p-2">Min</th>
                    <th className="text-right p-2">Max</th>
                    <th className="text-right p-2">Price/1k</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{service.id}</td>
                      <td className="p-2">{service.category.platform.name}</td>
                      <td className="p-2">{service.category.name}</td>
                      <td className="p-2">{service.name}</td>
                      <td className="p-2 text-right">{service.min}</td>
                      <td className="p-2 text-right">{service.max}</td>
                      <td className="p-2 text-right">৳{Number(service.pricePerK).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "" : `Showing ${filtered.length} of ${total} services`}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
