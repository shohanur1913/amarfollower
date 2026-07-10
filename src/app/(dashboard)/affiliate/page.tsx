"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserAffiliate } from "@/lib/queries";
import { toast } from "sonner";
import { Copy, Users, DollarSign, Clock } from "lucide-react";

interface Referral {
  id: number;
  username: string;
  email: string;
  commission: number;
  status: string;
  date: string;
}

interface AffiliateData {
  referralCode: string;
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  referrals: Referral[];
}

const statusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    case "pending": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

function SkeletonCard() {
  return <div className="h-24 bg-muted animate-pulse rounded-lg" />;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="p-2"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function AffiliatePage() {
  const { data, isLoading } = useUserAffiliate();
  const stats = data as AffiliateData | undefined;

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Affiliate Program</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${stats?.referralCode || ""}`}
                readOnly
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-muted"
              />
              <Button onClick={copyReferralLink} className="shrink-0">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          [1,2,3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{(stats?.totalCommission || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{(stats?.pendingCommission || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="text-right p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission</th>
                  <th className="text-center p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                </tr></thead>
                <tbody>
                  {[1,2,3].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : !stats?.referrals || stats.referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrals yet. Share your link to earn commissions!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-right p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission</th>
                    <th className="text-center p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.referrals.map((ref) => (
                    <tr key={ref.id} className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{ref.username}</p>
                          <p className="text-xs text-muted-foreground">{ref.email}</p>
                        </div>
                      </td>
                      <td className="p-2 text-right font-medium">৳{ref.commission.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <Badge className={statusColor(ref.status)}>{ref.status}</Badge>
                      </td>
                      <td className="p-2 text-muted-foreground">{new Date(ref.date).toLocaleDateString()}</td>
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
