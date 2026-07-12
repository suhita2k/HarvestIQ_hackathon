"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { LANGUAGES, type LanguageCode, createTranslator } from "@/lib/i18n";

type Theme = "light" | "dark";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [language, setLanguageState] = React.useState<LanguageCode>("en");

  React.useEffect(() => {
    const stored = localStorage.getItem("harvestiq_theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem("harvestiq_lang") as LanguageCode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setLanguageState(stored);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("harvestiq_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const setLanguage = React.useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("harvestiq_lang", lang);
  }, []);

  const t = React.useMemo(() => createTranslator(language), [language]);

  const value = React.useMemo(
    () => ({ theme, toggleTheme, language, setLanguage, t }),
    [theme, toggleTheme, language, setLanguage, t]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1e293b" : "#ffffff",
            color: theme === "dark" ? "#f1f5f9" : "#0f172a",
            border: "1px solid",
            borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
          },
        }}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { LANGUAGES };
