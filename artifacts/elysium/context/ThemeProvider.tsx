import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { loadJSON, saveJSON } from "@/lib/storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeCtxValue {
  mode: ThemeMode;
  systemScheme: "light" | "dark" | null | undefined;
  setMode: (m: ThemeMode) => void;
  resolved: "light" | "dark";
}

export const ThemeCtx = createContext<ThemeCtxValue | null>(null);

const STORAGE_KEY = "theme-mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("light"); // "light" = our dark visual UI
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadJSON<ThemeMode | null>(STORAGE_KEY, null);
      if (mounted && stored) setModeState(stored);
      setHydrated(true);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveJSON(STORAGE_KEY, mode);
  }, [mode, hydrated]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);

  const resolved: "light" | "dark" =
    mode === "system"
      ? (systemScheme === "dark" ? "dark" : "light")
      : mode === "dark" ? "dark" : "light";

  return (
    <ThemeCtx.Provider value={{ mode, systemScheme, setMode, resolved }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
