"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserScheduledOrders } from "@/lib/queries";

interface ScheduledOrder {
  id: number;
  service: { name: string };
  link: string;
  quantity: number;
  intervalHours: number;
  nextRunAt: string;
  totalRuns: number;
  maxRuns: number | null;
  status: string;
}

const tableHeadClass = "text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground";

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="p-2"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function ScheduledOrdersPage() {
  const { data: orders = [], isLoading } = useUserScheduledOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scheduled Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recurring Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className={tableHeadClass}>Service</th>
                  <th className={tableHeadClass}>Link</th>
                  <th className={tableHeadClass + " text-right"}>Qty</th>
                  <th className={tableHeadClass + " text-right"}>Interval</th>
                  <th className={tableHeadClass + " text-right"}>Runs</th>
                  <th className={tableHeadClass + " text-center"}>Status</th>
                  <th className={tableHeadClass}>Next Run</th>
                </tr></thead>
                <tbody>
                  {[1,2,3,4].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">No scheduled orders.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b">
                    <th className={tableHeadClass}>Service</th>
                    <th className={tableHeadClass}>Link</th>
                    <th className={tableHeadClass + " text-right"}>Qty</th>
                    <th className={tableHeadClass + " text-right"}>Interval</th>
                    <th className={tableHeadClass + " text-right"}>Runs</th>
                    <th className={tableHeadClass + " text-center"}>Status</th>
                    <th className={tableHeadClass}>Next Run</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders as ScheduledOrder[]).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{order.service.name}</td>
                      <td className="p-2 max-w-[150px] truncate">{order.link}</td>
                      <td className="p-2 text-right">{order.quantity}</td>
                      <td className="p-2 text-right">{order.intervalHours}h</td>
                      <td className="p-2 text-right">{order.totalRuns}{order.maxRuns ? `/${order.maxRuns}` : ""}</td>
                      <td className="p-2 text-center">
                        <Badge className={order.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(order.nextRunAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
