"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/pagination";
import { useUserPayments } from "@/lib/queries";

interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  feeAmount: number;
  gateway: string;
  status: string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;
const STATUSES = ["all", "completed", "pending", "failed"] as const;

const statusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    case "pending": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    case "failed": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

const tableHeadClass = "text-left p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground";

function SkeletonRow() {
  return (
    <tr className="border-b">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="p-2"><div className="h-4 bg-muted animate-pulse rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { data, isLoading } = useUserPayments(page, statusFilter || undefined);

  const payments: Payment[] = data?.payments ?? [];
  const pagination: PaginationMeta | undefined = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

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
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className={tableHeadClass}>Transaction</th>
                  <th className={tableHeadClass + " text-right"}>Amount</th>
                  <th className={tableHeadClass + " text-right"}>Fee</th>
                  <th className={tableHeadClass}>Gateway</th>
                  <th className={tableHeadClass + " text-center"}>Status</th>
                  <th className={tableHeadClass}>Date</th>
                </tr></thead>
                <tbody>
                  {[1,2,3,4,5].map((i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : payments.length === 0 ? (
            <p className="text-muted-foreground">{statusFilter ? `No ${statusFilter} transactions.` : "No transactions yet."}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className={tableHeadClass}>Transaction</th>
                      <th className={tableHeadClass + " text-right"}>Amount</th>
                      <th className={tableHeadClass + " text-right"}>Fee</th>
                      <th className={tableHeadClass}>Gateway</th>
                      <th className={tableHeadClass + " text-center"}>Status</th>
                      <th className={tableHeadClass}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(payments as Payment[]).map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td className="p-2 font-mono text-xs">{payment.transactionId}</td>
                        <td className="p-2 text-right">৳{Number(payment.amount).toFixed(2)}</td>
                        <td className="p-2 text-right">৳{Number(payment.feeAmount).toFixed(2)}</td>
                        <td className="p-2">{payment.gateway}</td>
                        <td className="p-2 text-center">
                          <Badge className={statusColor(payment.status)}>{payment.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && <Pagination page={page} totalItems={pagination.total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayment} onOpenChange={(open) => { if (!open) setSelectedPayment(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium font-mono text-xs">{selectedPayment.transactionId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">৳{Number(selectedPayment.amount).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Fee:</span>
                <span className="font-medium">৳{Number(selectedPayment.feeAmount).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">৳{(Number(selectedPayment.amount) + Number(selectedPayment.feeAmount)).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Gateway:</span>
                <span className="font-medium">{selectedPayment.gateway}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={statusColor(selectedPayment.status)}>{selectedPayment.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
