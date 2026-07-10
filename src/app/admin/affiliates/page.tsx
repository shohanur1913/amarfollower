"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableActions, TableAction } from "@/components/table-actions";
import { useAdminAffiliates } from "@/lib/queries";
import { Users, TrendingUp, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

interface Referral {
  id: number;
  referrer: { id: number; username: string; email: string };
  referred: { id: number; username: string; email: string };
  commission: number;
  status: string;
  createdAt: string;
}

export default function AdminAffiliatesPage() {
  const router = useRouter();
  const { data: referrals = [], isLoading, refetch } = useAdminAffiliates();
  const [page, setPage] = useState(1);

  const pageSize = 25;
  const paginatedReferrals = (referrals as Referral[]).slice((page - 1) * pageSize, page * pageSize);

  const totalCommission = (referrals as Referral[]).reduce(
    (sum, r) => sum + Number(r.commission), 0
  );
  const completedCount = (referrals as Referral[]).filter(
    (r) => r.status === "completed"
  ).length;

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getReferralActions = (referral: Referral): TableAction[] => {
    const actions: TableAction[] = [
      {
        label: "View Referrer",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => router.push(`/admin/orders?user=${referral.referrer.id}`),
      },
      {
        label: "View Referred User",
        icon: <Users className="h-4 w-4" />,
        onClick: () => router.push(`/admin/orders?user=${referral.referred.id}`),
      },
    ];
    return actions;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Affiliates & Referrals</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{(referrals as Referral[]).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{completedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">৳{totalCommission.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Referrals ({(referrals as Referral[]).length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (referrals as Referral[]).length === 0 ? <p>No referrals yet.</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 sticky top-0">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Referrer</th>
                    <th className="text-left p-2">Referred User</th>
                    <th className="text-right p-2">Commission</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-center p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedReferrals.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-2">{r.id}</td>
                        <td className="p-2 font-medium">{r.referrer.username}</td>
                        <td className="p-2">{r.referred.username}</td>
                        <td className="p-2 text-right">৳{Number(r.commission).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Badge className={statusColor(r.status)}>{r.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 text-center">
                          <TableActions actions={getReferralActions(r)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalItems={(referrals as Referral[]).length} pageSize={pageSize} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
