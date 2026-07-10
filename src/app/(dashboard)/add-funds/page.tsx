"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUserPayments } from "@/lib/queries";
import { Loader2, Wallet } from "lucide-react";

interface Gateway {
  id: number;
  name: string;
  displayName: string;
  currency: string;
  status: number;
}

interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  feeAmount: number;
  gateway: string;
  status: string;
  createdAt: string;
}

function SkeletonGateways() {
  return (
    <div className="space-y-2">
      {[1,2].map((i) => (
        <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

export default function AddMoneyPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [gateway, setGateway] = useState("");
  const [amount, setAmount] = useState("");
  const [feePercent, setFeePercent] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("৳");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingGateways(true);
      const [gwRes, settingsRes] = await Promise.all([
        fetch("/api/gateways"),
        fetch("/api/settings"),
      ]);

      if (cancelled) return;

      if (gwRes.ok) {
        const data = (await gwRes.json()) as Gateway[];
        const active = data.filter((g) => g.status === 1);
        setGateways(active);
        if (active.length > 0) setGateway(active[0].name);
      }

      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setFeePercent(Number(s.processing_fee_percent || "0"));
        setCurrencySymbol(s.currency_symbol || "৳");
      }

      setLoadingGateways(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const feeAmount = amount ? ((Number(amount) * feePercent) / 100).toFixed(2) : "0.00";
  const totalAmount = amount ? (Number(amount) + Number(feeAmount)).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gateway || !amount || Number(amount) <= 0) {
      toast.error("Please select a payment method and enter an amount.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway, amount: Number(amount) }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success || !data?.pp_url) {
        toast.error(data?.error || "Payment initiation failed. Please try again.");
        return;
      }

      window.location.href = data.pp_url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add Funds</h1>

      <Card className="border-none shadow-xl bg-gradient-to-br from-white/[0.92] to-white/70 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-5 w-5 text-[#6366f1]" />
            Add Funds
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a payment method and deposit amount to continue.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                Payment Method
              </Label>
              {loadingGateways ? (
                <SkeletonGateways />
              ) : gateways.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment methods available.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {gateways.map((gw) => (
                    <label
                      key={gw.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        gateway === gw.name
                          ? "border-[#6366f1] bg-[#6366f1]/5"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={gw.name}
                        checked={gateway === gw.name}
                        onChange={(e) => setGateway(e.target.value)}
                        className="h-4 w-4 text-[#6366f1] focus:ring-[#6366f1]"
                      />
                      <span className="text-sm font-semibold text-slate-700">{gw.displayName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Deposit Amount ({currencySymbol})</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 text-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 border p-4 text-sm">
                <p className="text-muted-foreground mb-1">Processing Fee</p>
                <p className="font-semibold">{currencySymbol}{feeAmount}</p>
              </div>
              <div className="rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 p-4 text-sm">
                <p className="text-muted-foreground mb-1">Total to Pay</p>
                <p className="font-semibold text-[#6366f1]">{currencySymbol}{totalAmount}</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base bg-[#6366f1] hover:bg-[#6366f1]/90"
              disabled={loading || !gateway || !amount}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <RecentDeposits />
    </div>
  );
}

const statusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "failed": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

function RecentDeposits() {
  const { data: payments = [], isLoading } = useUserPayments();
  const recent = (payments as Payment[]).slice(0, 5);

  return (
    <Card className="border-dashed border-2 bg-white/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Deposits</CardTitle>
        <Link href="/transactions" className="text-xs text-[#6366f1] font-semibold underline-offset-2 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deposits yet. Your payment history will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((payment: Payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">৳{Number(payment.amount).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className={statusColor(payment.status)}>{payment.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
