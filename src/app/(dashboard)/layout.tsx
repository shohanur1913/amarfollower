"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Ticket,
  User,
  Code,
  Users,
  Clock,
  Menu,
  LogOut,
  ChevronRight,
  Shield,
  PanelLeftClose,
  PanelLeft,
  Wallet,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useUserProfile, usePublicSettings } from "@/lib/queries";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";

const SIDEBAR_COLLAPSED_KEY = "user-sidebar-collapsed";
const SIDEBAR_WIDTH = 288;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const publicNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-funds", label: "Add Funds", icon: Wallet },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/services", label: "Services", icon: Package },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/mass-order", label: "Mass Order", icon: Package },
  { href: "/scheduled-orders", label: "Scheduled Orders", icon: Clock },
  { href: "/affiliate", label: "Affiliate", icon: Users },
  { href: "/api-keys", label: "API Keys", icon: Code },
];

function NavContent({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <nav className="flex flex-col px-3 pt-4 pb-1">
        <div className="space-y-0.5">
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group flex items-center justify-center p-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-[#6366f1]/10 text-[#6366f1]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive
                      ? "text-[#6366f1]"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col px-3 pt-4 pb-1">
      <div className="space-y-0.5">
        {publicNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#6366f1]/10 text-[#6366f1]"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-colors duration-150 ${
                  isActive
                    ? "text-[#6366f1]"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: settings } = usePublicSettings();
  const siteName = (settings?.site_name as string) || "AmarFollower";
  const logoUrl = (settings?.logo_url as string) || "";
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const userName = profileLoading ? "Loading..." : (profile?.username || "User");
  const userEmail = profileLoading ? "" : (profile?.email || "");
  const userInitial = (userName?.[0] || "U").toUpperCase();

  const sidebarWidth = mounted
    ? collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH
    : SIDEBAR_WIDTH;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>

            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex p-2 hover:bg-accent rounded-lg transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="t-icon-swap" data-state={collapsed ? "b" : "a"}>
                <span className="t-icon" data-icon="a"><PanelLeftClose className="size-5 text-foreground" /></span>
                <span className="t-icon" data-icon="b"><PanelLeft className="size-5 text-foreground" /></span>
              </div>
            </button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent side="left" className="w-72 p-0 border-border">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  {logoUrl ? (
                    <img src={logoUrl} alt={siteName} className="h-8 max-w-[140px] object-contain" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#6366f1] flex items-center justify-center shadow-sm">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">AmarFollower</p>
                        <p className="text-xs text-muted-foreground">User Panel</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 py-1">
                  <NavContent pathname={pathname} collapsed={false} />
                </div>
                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#6366f1] text-white font-bold text-xs">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 max-w-[160px] object-contain" />
              ) : (
                <>
                  <div className="h-9 w-9 rounded-xl bg-[#6366f1] flex items-center justify-center shadow-sm">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-bold text-base text-foreground">AmarFollower</span>
                    <span className="ml-2 text-[10px] font-semibold text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded-md">USER</span>
                  </div>
                </>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/add-funds")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Add Funds
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/transactions")}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Transactions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="light" className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className="hidden lg:block bg-card border-r border-border min-h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
          style={{ width: sidebarWidth }}
        >
          <NavContent pathname={pathname} collapsed={collapsed} />

          {!collapsed && (
            <div className="sticky bottom-0 bg-card border-t border-border p-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[#6366f1] text-white font-bold text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
                <button className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="sticky bottom-0 bg-card border-t border-border p-3 flex justify-center">
              <div
                className="h-9 w-9 rounded-full bg-[#6366f1] flex items-center justify-center ring-2 ring-[#6366f1]/20"
                title={userName}
              >
                <span className="text-sm font-bold text-white">{userInitial}</span>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

