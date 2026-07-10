"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserOrders } from "@/lib/queries";

interface Order {
  id: number;
  service: { name: string };
  link: string;
  quantity: number;
  charge: number;
  status: string;
  startCount: string | null;
  remains: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const statusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    case "processing": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    case "pending": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    case "cancelled": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    case "refunded": return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

const tableHeadClass = "text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground";

function OrderDetailModal({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{order.service.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Link:</span>
            <span className="font-medium break-all">{order.link}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">{order.quantity}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Charge:</span>
            <span className="font-medium">৳{Number(order.charge).toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge className={statusColor(order.status)}>{order.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Start Count:</span>
            <span className="font-medium">{order.startCount || "—"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Remains:</span>
            <span className="font-medium">{order.remains || "—"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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

const STATUSES = ["all", "pending", "processing", "completed", "cancelled", "refunded"] as const;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data, isLoading } = useUserOrders(page, statusFilter || undefined);

  const orders: Order[] = data?.orders ?? [];
  const pagination: Pagination | undefined = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s === "all" ? "" : s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              (s === "all" && !statusFilter) || s === statusFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className={tableHeadClass}>ID</th>
                  <th className={tableHeadClass}>Service</th>
                  <th className={tableHeadClass}>Link</th>
                  <th className={tableHeadClass + " text-right"}>Quantity</th>
                  <th className={tableHeadClass + " text-right"}>Charge</th>
                  <th className={tableHeadClass + " text-center"}>Status</th>
                  <th className={tableHeadClass}>Date</th>
                </tr></thead>
                <tbody>
                  {[1,2,3,4,5].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">{statusFilter ? `No ${statusFilter} orders.` : "No orders yet."}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="border-b">
                      <th className={tableHeadClass}>ID</th>
                      <th className={tableHeadClass}>Service</th>
                      <th className={tableHeadClass}>Link</th>
                      <th className={tableHeadClass + " text-right"}>Quantity</th>
                      <th className={tableHeadClass + " text-right"}>Charge</th>
                      <th className={tableHeadClass + " text-center"}>Status</th>
                      <th className={tableHeadClass}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders as Order[]).map((order) => (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="p-2">{order.id}</td>
                        <td className="p-2">{order.service.name}</td>
                        <td className="p-2 max-w-[200px] truncate">{order.link}</td>
                        <td className="p-2 text-right">{order.quantity}</td>
                        <td className="p-2 text-right">৳{Number(order.charge).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Badge className={statusColor(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailModal order={selectedOrder} open={!!selectedOrder} onOpenChange={(o) => { if (!o) setSelectedOrder(null); }} />
    </div>
  );
}