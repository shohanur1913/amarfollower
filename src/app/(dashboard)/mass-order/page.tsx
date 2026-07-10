"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { massOrderSchema, type MassOrderInput } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface OrderResult {
  id: number;
  status: string;
}

interface MassOrderResult {
  success?: boolean;
  error?: string;
  orders?: OrderResult[];
}

export default function MassOrderPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MassOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MassOrderInput>({
    resolver: zodResolver(massOrderSchema),
    defaultValues: { orders: "" },
  });

  const onSubmit = async (data: MassOrderInput) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/user/mass-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      setResult(body);
      if (body.error) {
        toast.error(body.error);
      } else {
        toast.success(`Placed ${body.orders?.length || 0} orders`);
      }
    } catch {
      setResult({ error: "Something went wrong" });
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mass Order</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orders">Orders (one per line: service_id | link | quantity)</Label>
              <Textarea
                id="orders"
                placeholder={"1 | https://instagram.com/user | 1000\n2 | https://tiktok.com/user | 500"}
                {...register("orders")}
                rows={10}
              />
              {errors.orders && <p className="text-sm text-red-600">{errors.orders.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Place Orders"}
            </Button>
          </form>

          {result && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-sm">Result</h3>
              {result.error ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md text-sm text-red-700">
                  <XCircle className="h-4 w-4" />
                  {result.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully placed {result.orders?.length || 0} order(s)
                  </div>
                  {result.orders && result.orders.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Order ID</th>
                            <th className="text-center p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.orders.map((o) => (
                            <tr key={o.id} className="border-b">
                              <td className="p-2 font-mono">#{o.id}</td>
                              <td className="p-2 text-center">
                                <Badge className={o.status === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                  {o.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
