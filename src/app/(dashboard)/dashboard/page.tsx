"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePlatforms, useUserStats } from "@/lib/queries";
import { PlatformIcon } from "@/components/platform-icon";
import { toast } from "sonner";
import { Search, ChevronDown, Info, Zap, Gauge, RotateCcw, CheckCircle2, X } from "lucide-react";

interface Platform {
  id: number;
  name: string;
  iconClass: string | null;
  categories: Category[];
}
interface Category {
  id: number;
  name: string;
  platformId: number;
  services: Service[];
}
interface Service {
  id: number;
  name: string;
  min: number;
  max: number;
  pricePerK: number;
  perAmount: number;
  description?: string;
  startTime?: string;
  speed?: string;
  guarantee?: string;
}

interface OrderReceipt {
  orderId: number;
  serviceName: string;
  link: string;
  qty: number;
  charge: number;
  newBalance: number;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();

  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [serOpen, setSerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const platformId = selectedPlatform ?? platforms[0]?.id ?? null;

  const filteredCategories = useMemo(
    () =>
      platformId
        ? platforms
            .find((p: Platform) => p.id === platformId)
            ?.categories || []
        : [],
    [platforms, platformId]
  );

  const selectedCategory = useMemo(
    () => filteredCategories.find((c: Category) => c.id === selectedCategoryId) ?? filteredCategories[0] ?? null,
    [filteredCategories, selectedCategoryId]
  );

  const filteredServices = useMemo(
    () => selectedCategory?.services || [],
    [selectedCategory]
  );

  const selectedService = useMemo(
    () => filteredServices.find((s: Service) => s.id === selectedServiceId) ?? filteredServices[0] ?? null,
    [filteredServices, selectedServiceId]
  );

  const allServices = useMemo(
    () => platforms.flatMap((p: Platform) => p.categories.flatMap((c: Category) => c.services)),
    [platforms]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return allServices
      .filter((s: Service) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 20);
  }, [searchQuery, allServices]);

  const totalCharge = useMemo(() => {
    if (!selectedService || !quantity) return "0.000";
    const price = Number(selectedService.pricePerK);
    const per = selectedService.perAmount || 1000;
    return ((price * Number(quantity)) / per).toFixed(3);
  }, [selectedService, quantity]);

  const handlePlatformSelect = (platformId: number) => {
    setSelectedPlatform(platformId);
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
    const cats = platforms.find((p: Platform) => p.id === platformId)?.categories || [];
    if (cats.length > 0) {
      setSelectedCategoryId(cats[0].id);
      if (cats[0].services.length > 0) {
        setSelectedServiceId(cats[0].services[0].id);
      }
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategoryId(cat.id);
    setCatOpen(false);
    setSelectedServiceId(cat.services.length > 0 ? cat.services[0].id : null);
  };

  const handleSearchSelect = (service: Service) => {
    const parentCat = platforms
      .flatMap((p: Platform) => p.categories)
      .find((c: Category) => c.services.some((s: Service) => s.id === service.id));
    if (parentCat) {
      setSelectedPlatform(parentCat.platformId);
      setSelectedCategoryId(parentCat.id);
      setSelectedServiceId(service.id);
    }
    setSearchOpen(false);
    setSearchQuery("");
    toast.success("Service loaded!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    if (!quantity || Number(quantity) < selectedService.min) {
      toast.error(`Minimum quantity is ${selectedService.min}`);
      return;
    }
    if (Number(quantity) > selectedService.max) {
      toast.error(`Maximum quantity is ${selectedService.max}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link,
          quantity: Number(quantity),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }
      setReceipt({
        orderId: data.orderId,
        serviceName: selectedService.name,
        link,
        qty: Number(quantity),
        charge: Number(totalCharge),
        newBalance: (stats?.balance || 0) - Number(totalCharge),
      });
      setLink("");
      setQuantity("");
      toast.success("Order placed successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = statsLoading || platformsLoading;

  return (
    <div className="space-y-4 pb-10">
      {/* 1. TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#18181b] p-3 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Username</p>
          <p className="text-base font-extrabold text-gray-900 dark:text-white">
            {isLoading ? <span className="h-5 w-20 bg-muted animate-pulse inline-block rounded" /> : stats?.username}
          </p>
        </div>
        <div className="bg-white dark:bg-[#18181b] p-3 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Balance</p>
          <p className="text-base font-extrabold text-primary">
            ৳{isLoading ? "..." : (receipt?.newBalance ?? stats?.balance ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-[#18181b] p-3 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Total Spend</p>
          <p className="text-base font-extrabold text-gray-900 dark:text-white">
            ৳{isLoading ? "..." : (stats?.totalSpend ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-[#18181b] p-3 rounded-md border border-gray-200 dark:border-white/5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Your Orders</p>
          <p className="text-base font-extrabold text-gray-900 dark:text-white">
            {isLoading ? "..." : stats?.totalOrders ?? 0}
          </p>
        </div>
      </div>

      {/* 2. SUCCESS RECEIPT */}
      {receipt && (
        <div className="bg-white dark:bg-[#18181b] border-2 border-green-500 p-5 rounded-md shadow-lg relative animate-in slide-in-from-top-4">
          <button
            onClick={() => setReceipt(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Your order received
          </h4>
          <div className="space-y-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <p>ID: <span className="text-primary">#{receipt.orderId}</span></p>
            <p>Service: <span>{receipt.serviceName}</span></p>
            <p>Link: <span className="lowercase text-slate-500">{receipt.link}</span></p>
            <p>Quantity: <span>{receipt.qty}</span></p>
            <p>Charge: <span>৳{receipt.charge.toFixed(3)}</span></p>
            <p>Balance: <span>৳{receipt.newBalance.toFixed(2)}</span></p>
          </div>
        </div>
      )}

      {/* 3. PLATFORMS GRID */}
      {!isLoading && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
          {(platforms as Platform[]).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePlatformSelect(p.id)}
              className={`h-14 w-full flex items-center justify-center rounded-md border transition-all outline-none ${
                selectedPlatform === p.id
                  ? "bg-primary/20 border-primary text-primary shadow-md"
                  : "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              <PlatformIcon iconClass={p.iconClass} name={p.name} size={28} />
            </button>
          ))}
        </div>
      )}

      {/* 4. CONFIGURE ORDER */}
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Configure Order
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Search */}
          <div className="relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
              Quick Search Service
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Find any service instantly..."
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-10 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-primary transition text-left"
              />
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>
            {searchOpen && searchQuery.length > 1 && (
              <div
                className="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md shadow-2xl z-[60] max-h-72 overflow-y-auto"
                onMouseLeave={() => setSearchOpen(false)}
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-400">No services found</div>
                ) : (
                  searchResults.map((s: Service) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSearchSelect(s)}
                      className="w-full px-4 py-3 hover:bg-primary/5 cursor-pointer border-b border-gray-50 dark:border-white/5 transition text-left"
                    >
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.name}</p>
                      <p className="text-[9px] font-black text-primary uppercase mt-1">৳{Number(s.pricePerK).toFixed(2)}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Category Dropdown */}
              <div className="relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setCatOpen(!catOpen)}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left"
                >
                  <span className="truncate">{selectedCategory?.name || "Choose Category"}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
                {catOpen && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 max-h-72 overflow-y-auto">
                    {filteredCategories.map((c: Category) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCategorySelect(c)}
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
                  onClick={() => setSerOpen(!serOpen)}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left"
                >
                  <span className="truncate">{selectedService?.name || "Choose Service"}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
                {selectedService && (
                  <div className="mt-2 flex">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Price: ৳{Number(selectedService.pricePerK).toFixed(2)} / {selectedService.perAmount || 1000}
                    </span>
                  </div>
                )}
                {serOpen && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 max-h-72 overflow-y-auto">
                    {filteredServices.map((s: Service) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedServiceId(s.id); setSerOpen(false); }}
                        className="w-full px-3 py-3 border-b dark:border-white/5 hover:bg-primary hover:text-white cursor-pointer text-left"
                      >
                        <p className="font-bold text-xs">{s.name}</p>
                        <p className="text-[9px] font-black uppercase opacity-60 mt-1">Price: ৳{Number(s.pricePerK).toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
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
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  placeholder="URL or UID..."
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary text-left"
                />
              </div>
              {/* Quantity */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary text-left"
                />
                {selectedService && (
                  <div className="flex gap-2 mt-2 px-1">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Min: {selectedService.min}
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                      Max: {selectedService.max}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t dark:border-white/5">
              <div className="text-left">
                <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">Estimated Cost</p>
                <p className="text-xl font-black text-primary mt-1">৳{totalCharge}</p>
              </div>
              <button
                type="submit"
                disabled={loading || !selectedService}
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

      {/* 5. SERVICE SPECS & DESCRIPTION */}
      {selectedService && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Start Time", value: selectedService.startTime, icon: <Zap className="h-3.5 w-3.5" />, color: "text-amber-500" },
              { label: "Speed", value: selectedService.speed, icon: <Gauge className="h-3.5 w-3.5" />, color: "text-cyan-500" },
              { label: "Refill", value: selectedService.guarantee, icon: <RotateCcw className="h-3.5 w-3.5" />, color: "text-green-500" },
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
              {selectedService.description || "Quality prioritized service. Ensures delivery within time frame."}
            </p>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {isLoading && (
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
