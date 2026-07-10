"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatforms } from "@/lib/queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newOrderSchema, type NewOrderInput } from "@/lib/validations";
import { toast } from "sonner";

interface Platform {
  id: number;
  name: string;
  categories: Category[];
}

interface Category {
  id: number;
  name: string;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
  min: number;
  max: number;
  pricePerK: number;
  perAmount: number;
  startTime?: string;
  speed?: string;
  guarantee?: string;
  quality?: string;
  description?: string;
}

export default function NewOrderPage() {
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewOrderInput>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: {
      serviceId: 0,
      link: "",
      quantity: 0,
    },
  });

  const quantity = watch("quantity");

  const categories =
    platforms.find((p: Platform) => p.id === selectedPlatform)?.categories || [];
  const services =
    categories.find((c: Category) => c.id === selectedCategory)?.services || [];
  const selectedServiceData = services.find(
    (s: Service) => s.id === selectedService
  );

  const charge =
    selectedServiceData && quantity
      ? (quantity / selectedServiceData.perAmount) * selectedServiceData.pricePerK
      : 0;

  const onSubmit = async (data: NewOrderInput) => {
    setLoading(true);

    try {
      const res = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to place order");
        return;
      }

      toast.success("Order placed successfully!");
      setValue("link", "");
      setValue("quantity", 0);
      setSelectedService(null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (platformsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">New Order</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Order</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={selectedPlatform || ""}
                onChange={(e) => {
                  setSelectedPlatform(Number(e.target.value) || null);
                  setSelectedCategory(null);
                  setSelectedService(null);
                  setValue("serviceId", 0);
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select platform</option>
                {platforms.map((p: Platform) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={selectedCategory || ""}
                onChange={(e) => {
                  setSelectedCategory(Number(e.target.value) || null);
                  setSelectedService(null);
                  setValue("serviceId", 0);
                }}
                className="w-full border rounded-md px-3 py-2"
                disabled={!selectedPlatform}
              >
                <option value="">Select category</option>
                {categories.map((c: Category) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <select
                id="service"
                value={selectedService || ""}
                onChange={(e) => {
                  const serviceId = Number(e.target.value) || null;
                  setSelectedService(serviceId);
                  setValue("serviceId", serviceId || 0);
                }}
                className="w-full border rounded-md px-3 py-2"
                disabled={!selectedCategory}
              >
                <option value="">Select service</option>
                {services.map((s: Service) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - ৳{s.pricePerK}/1k
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <p className="text-sm text-red-600">{errors.serviceId.message}</p>
              )}
            </div>

            {selectedServiceData && (
              <div className="p-3 bg-gray-50 rounded-md text-sm space-y-1">
                <p><strong>Min:</strong> {selectedServiceData.min}</p>
                <p><strong>Max:</strong> {selectedServiceData.max}</p>
                <p><strong>Price:</strong> ৳{selectedServiceData.pricePerK}/1k</p>
                {selectedServiceData.startTime && (
                  <p><strong>Start Time:</strong> {selectedServiceData.startTime}</p>
                )}
                {selectedServiceData.speed && (
                  <p><strong>Speed:</strong> {selectedServiceData.speed}</p>
                )}
                <p><strong>Refill:</strong> {selectedServiceData.guarantee || "No Refill"}</p>
                {selectedServiceData.description && (
                  <p className="mt-2 text-gray-600">{selectedServiceData.description}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                {...register("link")}
              />
              {errors.link && (
                <p className="text-sm text-red-600">{errors.link.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1000"
                {...register("quantity", { valueAsNumber: true })}
                min={selectedServiceData?.min || 1}
                max={selectedServiceData?.max || 999999}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            {selectedServiceData && quantity > 0 && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-lg font-bold">Charge: ৳{charge.toFixed(2)}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
