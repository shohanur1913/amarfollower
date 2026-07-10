"use client";

import { useEffect } from "react";
import { useAdminSettings } from "@/lib/queries";

export function ThemeUpdater() {
  const { data: settings } = useAdminSettings();

  useEffect(() => {
    if (!settings) return;
    const s = settings as Record<string, string>;
    const root = document.documentElement;

    if (s.primary_color) {
      root.style.setProperty("--primary", s.primary_color);
      root.style.setProperty("--ring", s.primary_color);
      root.style.setProperty("--chart-1", s.primary_color);
      root.style.setProperty("--sidebar-primary", s.primary_color);
      root.style.setProperty("--sidebar-ring", s.primary_color);
    }

    if (s.secondary_color) {
      root.style.setProperty("--secondary", s.secondary_color);
      root.style.setProperty("--secondary-foreground", "#ffffff");
      root.style.setProperty("--sidebar-accent", s.secondary_color);
    }
  }, [settings]);

  return null;
}
