"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} });

export function usePublicTheme() { return useContext(ThemeCtx); }

export default function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fwa-theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("fwa-theme", next ? "dark" : "light");
  }

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}
