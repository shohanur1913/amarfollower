"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlatforms } from "@/lib/queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newOrderSchema, type NewOrderInput } from "@/lib/validations";
import { toast } from "sonner";
import { ChevronDown, Zap, Gauge, RotateCcw, Info } from "lucide-react";

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
  const [platOpen, setPlatOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [serOpen, setSerOpen] = useState(false);

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
      <div className="space-y-4 pb-10">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const selectedPlatformData = platforms.find((p: Platform) => p.id === selectedPlatform);
  const selectedCategoryData = categories.find((c: Category) => c.id === selectedCategory);

  return (
    <div className="space-y-4 pb-10">
      {/* PLATFORMS GRID */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {platforms.map((p: Platform) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelectedPlatform(p.id);
              setSelectedCategory(null);
              setSelectedService(null);
              setValue("serviceId", 0);
              const cats = p.categories || [];
              if (cats.length > 0) {
                setSelectedCategory(cats[0].id);
                if (cats[0].services.length > 0) {
                  setSelectedService(cats[0].services[0].id);
                  setValue("serviceId", cats[0].services[0].id);
                }
              }
            }}
            className={`h-14 w-full flex items-center justify-center rounded-md border transition-all outline-none text-xs font-bold ${
              selectedPlatform === p.id
                ? "bg-primary/20 border-primary text-primary shadow-md"
                : "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 text-slate-600 dark:text-slate-300"
            }`}
          >
            <span className="truncate px-1">{p.name}</span>
          </button>
        ))}
      </div>

      {/* CONFIGURE ORDER */}
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Configure Order
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Category Dropdown */}
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => { setCatOpen(!catOpen); setSerOpen(false); }}
                  disabled={!selectedPlatform}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left disabled:opacity-50"
                >
                  <span className="truncate">{selectedCategoryData?.name || "Choose Category"}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
                {catOpen && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 max-h-72 overflow-y-auto">
                    {categories.map((c: Category) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(c.id);
                          setCatOpen(false);
                          setSelectedService(null);
                          setValue("serviceId", 0);
                          if (c.services.length > 0) {
                            setSelectedService(c.services[0].id);
                            setValue("serviceId", c.services[0].id);
                          }
                        }}
                        className="w-full px-3 py-3 hover:bg-primary hover:text-white cursor-pointer text-xs font-bold border-b dark:border-white/5 transition text-left"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Dropdown */}
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
                  Service
                </label>
                <button
                  type="button"
                  onClick={() => { setSerOpen(!serOpen); setCatOpen(false); }}
                  disabled={!selectedCategory}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left disabled:opacity-50"
                >
                  <span className="truncate">{selectedServiceData?.name || "Choose Service"}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
                {selectedServiceData && (
                  <div className="mt-2 flex">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Price: ৳{Number(selectedServiceData.pricePerK).toFixed(2)} / {selectedServiceData.perAmount || 1000}
                    </span>
                  </div>
                )}
                {serOpen && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 max-h-72 overflow-y-auto">
                    {services.map((s: Service) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(s.id);
                          setValue("serviceId", s.id);
                          setSerOpen(false);
                        }}
                        className="w-full px-3 py-3 border-b dark:border-white/5 hover:bg-primary hover:text-white cursor-pointer text-left"
                      >
                        <p className="font-bold text-xs">{s.name}</p>
                        <p className="text-[9px] font-black uppercase opacity-60 mt-1">Price: ৳{Number(s.pricePerK).toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                )}
                {errors.serviceId && (
                  <p className="text-sm text-destructive mt-1">{errors.serviceId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Link */}
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1 px-1 text-left">
                  Link or Account ID
                  <span className="relative group">
                    <Info className="h-3 w-3 cursor-pointer text-primary" />
                    <span className="hidden group-hover:block absolute z-[70] bottom-full mb-2 left-0 w-48 p-2 bg-slate-900 text-white text-[9px] rounded shadow-xl font-bold uppercase tracking-tighter leading-tight">
                      Inputting wrong information will result in cancellation and refund.
                    </span>
                  </span>
                </label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  {...register("link")}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.link && (
                  <p className="text-sm text-destructive mt-1">{errors.link.message}</p>
                )}
              </div>
              {/* Quantity */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  {...register("quantity", { valueAsNumber: true })}
                  min={selectedServiceData?.min || 1}
                  max={selectedServiceData?.max || 999999}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
                )}
                {selectedServiceData && (
                  <div className="flex gap-2 mt-2 px-1">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Min: {selectedServiceData.min}
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Max: {selectedServiceData.max}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t dark:border-white/5">
              <div className="text-left">
                <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Estimated Cost</p>
                <p className="text-xl font-black text-primary mt-1">৳{charge.toFixed(2)}</p>
              </div>
              <button
                type="submit"
                disabled={loading || !selectedServiceData}
                className="bg-primary text-white font-black px-10 py-3 rounded-md shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SERVICE SPECS & DESCRIPTION */}
      {selectedServiceData && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Start Time", value: selectedServiceData.startTime, icon: <Zap className="h-3.5 w-3.5" />, color: "text-amber-500" },
              { label: "Speed", value: selectedServiceData.speed, icon: <Gauge className="h-3.5 w-3.5" />, color: "text-cyan-500" },
              { label: "Refill", value: selectedServiceData.guarantee, icon: <RotateCcw className="h-3.5 w-3.5" />, color: "text-green-500" },
            ].map((spec) => (
              <div key={spec.label} className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-3 rounded-md flex items-center gap-3 shadow-sm">
                <div className={`h-8 w-8 rounded-md bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs ${spec.color}`}>
                  {spec.icon}
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{spec.label}</p>
                  <p className="text-xs font-black dark:text-white mt-1">{spec.value || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-3 rounded-md text-left">
            <p className="text-[10px] font-bold text-primary uppercase mb-1">Service Description</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tighter">
              {selectedServiceData.description || "Quality prioritized service. Ensures delivery within time frame."}
            </p>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {platformsLoading && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
