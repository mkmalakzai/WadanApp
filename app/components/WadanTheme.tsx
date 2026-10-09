"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; setTheme: (next: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "wadan-app-theme";

export function WadanThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // Private browsing may disable local storage.
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-wadan-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for this browser session.
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const value = useContext(ThemeContext);
  if (!value) return null;

  const isDark = value.theme === "dark";
  return (
    <button
      type="button"
      className={"wadan-theme-toggle" + (compact ? " compact" : "")}
      onClick={() => value.setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
      {!compact && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
