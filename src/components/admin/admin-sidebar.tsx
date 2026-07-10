"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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
  Users,
  ShoppingCart,
  Package,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  Globe,
  Upload,
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Layers,
  Headphones,
  FolderTree,
  Server,
  Palette,
  Coins,
  Lock,
  Brain,
  Wrench,
  PanelLeftClose,
  PanelLeft,
  Bell,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  User,
} from "lucide-react";
import { usePublicSettings } from "@/lib/queries";
import { useTheme } from "@/hooks/use-theme";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";
const SIDEBAR_WIDTH = 288;
const SIDEBAR_COLLAPSED_WIDTH = 72;

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: "default" | "success" | "warning" | "danger";
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const adminNavSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Service Catalog",
    items: [
      { href: "/admin/platforms", label: "Platforms", icon: Layers },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/services", label: "Services", icon: Package },
      { href: "/admin/providers", label: "Providers", icon: Server },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/tickets", label: "Tickets", icon: Headphones },
    ],
  },
  {
    title: "Financial",
    items: [
      { href: "/admin/gateways", label: "Gateways", icon: CreditCard },
      { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/import-services", label: "Import Services", icon: Upload },
      { href: "/admin/cron", label: "Cron Jobs", icon: Clock },
      { href: "/admin/developer-portal", label: "Developer Portal", icon: BookOpen },
      { href: "/admin/ip-whitelist", label: "IP Whitelist", icon: Globe },
      { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
    ],
  },
];

const settingsItems: NavItem[] = [
  { href: "/admin/settings/general", label: "General", icon: Settings },
  { href: "/admin/settings/branding", label: "Branding", icon: Palette },
  { href: "/admin/settings/currency", label: "Currency", icon: Coins },
  { href: "/admin/settings/security", label: "Security", icon: Lock },
  { href: "/admin/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings/ai", label: "AI Engine", icon: Brain },
  { href: "/admin/settings/system", label: "System", icon: Wrench },
];

const badgeColors: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
};

function SidebarSection({
  section,
  pathname,
  collapsed,
}: {
  section: NavSection;
  pathname: string;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  if (collapsed) {
    return (
      <div className="px-3 pt-4 pb-1">
        <div className="space-y-0.5">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group flex items-center justify-center p-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-[#6366f1]/10 text-[#6366f1]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive
                      ? "text-[#6366f1]"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-5 pb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 mb-1"
      >
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="space-y-0.5">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
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
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      badgeColors[item.badgeColor || "default"]
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="px-3 pt-4 pb-1">
        <div className="space-y-0.5">
          {settingsItems.map((item) => {
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
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive
                      ? "text-[#6366f1]"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-5 pb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 mb-1"
      >
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Settings
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="space-y-0.5">
          {settingsItems.map((item) => {
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
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminNavContent({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <nav className="flex flex-col">
      {adminNavSections.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          pathname={pathname}
          collapsed={collapsed}
        />
      ))}
      <SettingsSection pathname={pathname} collapsed={collapsed} />
    </nav>
  );
}

export function AdminSidebarContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams().toString();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [admin, setAdmin] = useState<{ username: string; email: string } | null>(null);
  const { data: settings } = usePublicSettings();
  const { theme, setTheme } = useTheme();
  const siteName = (settings?.site_name as string) || "AmarFollower";
  const logoUrl = (settings?.logo_url as string) || "";

  const adminName = admin?.username || "Admin";
  const adminEmail = admin?.email || "admin@amarfollower.com";
  const adminInitial = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setAdmin(data);
      })
      .catch(() => {});
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout?admin=true", { method: "POST" });
    router.push("/admin/login");
  };

  const sidebarWidth = mounted
    ? collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH
    : SIDEBAR_WIDTH;

  return (
    <div className="min-h-screen bg-background">
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
          <span className="t-icon" data-icon="a"><PanelLeftClose className="h-5 w-5 text-foreground" /></span>
          <span className="t-icon" data-icon="b"><PanelLeft className="h-5 w-5 text-foreground" /></span>
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
                        <p className="text-xs text-muted-foreground">Admin Panel</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 py-1">
                  <AdminNavContent pathname={pathname} collapsed={false} />
                </div>
                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#6366f1] text-white font-bold text-xs">
                        {adminInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {adminEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3"
            >
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 max-w-[160px] object-contain" />
              ) : (
                <>
                  <div className="h-9 w-9 rounded-xl bg-[#6366f1] flex items-center justify-center shadow-sm">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-bold text-base text-foreground">AmarFollower</span>
                    <span className="ml-2 text-[10px] font-semibold text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded-md">ADMIN</span>
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
                    {adminInitial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#6366f1] text-white font-bold">
                      {adminInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{adminName}</p>
                    <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  User Panel
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
                  className="text-destructive focus:text-destructive cursor-pointer"
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
          className="hidden lg:block bg-card border-r border-border sticky top-16 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
          style={{ width: sidebarWidth }}
        >
          <div className="py-2">
            <AdminNavContent pathname={pathname} collapsed={collapsed} />
          </div>

          {!collapsed && (
            <div className="sticky bottom-0 bg-card border-t border-border p-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/10 flex items-center justify-center ring-2 ring-[#6366f1]/20">
                  <span className="text-sm font-bold text-[#6366f1]">{adminInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {adminName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {adminEmail}
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
                className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#6366f1]/10 flex items-center justify-center ring-2 ring-[#6366f1]/20 cursor-pointer"
                title={adminName}
              >
                <span className="text-sm font-bold text-[#6366f1]">{adminInitial}</span>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}