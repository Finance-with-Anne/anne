"use client";

import { createContext, useContext, useState } from "react";

type ThemeCtx = { dark: boolean; toggle: () => void };
const AdminThemeContext = createContext<ThemeCtx>({ dark: true, toggle: () => {} });

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);
  return (
    <AdminThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);
