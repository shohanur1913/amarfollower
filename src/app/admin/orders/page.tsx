"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableActions, TableAction } from "@/components/table-actions";
import { EditOrderDialog } from "@/components/admin/edit-order-dialog";
import { OrderDetailsDialog } from "@/components/admin/order-details-dialog";
import { useAdminOrders } from "@/lib/queries";
import { Eye, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Order {
  id: number;
  user: { username: string; email: string };
  service: { name: string };
  link: string;
  quantity: number;
  charge: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || undefined;
  const { data: orders = [], isLoading, refetch } = useAdminOrders(userId);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 25;
  const paginatedOrders = (orders as Order[]).slice((page - 1) * pageSize, page * pageSize);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing":
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOrderActions = (order: Order): TableAction[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => { setViewOrder(order); setViewOpen(true); },
    },
    {
      label: "Edit Status",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => { setEditOrder(order); setEditOpen(true); },
    },
    {
      label: "Cancel & Refund",
      icon: <XCircle className="h-4 w-4" />,
      onClick: async () => {
        if (!confirm(`Cancel order #${order.id} and refund ৳${Number(order.charge).toFixed(2)}?`)) return;
        try {
          const res = await fetch("/api/admin/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: order.id, status: "cancelled" }),
          });
          if (res.ok) {
            toast.success("Order cancelled and refunded");
            refetch();
          } else {
            toast.error("Failed to cancel order");
          }
        } catch {
          toast.error("Failed to cancel order");
        }
      },
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{userId ? "User Orders" : "Orders"}</h1>
        {userId && (
          <span className="text-sm text-muted-foreground">Filtered by user #{userId}</span>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>All Orders ({orders.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? <p>No orders.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Service</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-right p-2">Charge</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedOrders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{o.id}</td>
                        <td className="p-2">{o.user.username}</td>
                        <td className="p-2">{o.service.name}</td>
                        <td className="p-2 text-right">{o.quantity}</td>
                        <td className="p-2 text-right">৳{Number(o.charge).toFixed(2)}</td>
                        <td className="p-2 text-center"><Badge className={statusColor(o.status)}>{o.status}</Badge></td>
                        <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          <TableActions actions={getOrderActions(o)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={orders.length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
      <OrderDetailsDialog order={viewOrder} open={viewOpen} onOpenChange={setViewOpen} />
      <EditOrderDialog order={editOrder} open={editOpen} onOpenChange={setEditOpen} onSaved={() => refetch()} />
    </div>
  );
}
