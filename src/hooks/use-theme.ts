"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "theme-preference";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(STORAGE_KEY) as Theme) || "light";
  });
  const mounted = typeof window !== "undefined";

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  return { theme, setTheme, resolvedTheme, mounted };
}
