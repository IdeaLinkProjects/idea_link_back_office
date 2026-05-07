"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type Theme = "light" | "dark";

type AppPreferencesContextValue = {
  theme: Theme;
  locale: string;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: string) => void;
};

const STORAGE_THEME_KEY = "ideal-link-theme";
const STORAGE_LOCALE_KEY = "ideal-link-locale";

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return localStorage.getItem(STORAGE_THEME_KEY) === "dark" ? "dark" : "light";
  });
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return localStorage.getItem(STORAGE_LOCALE_KEY) || "en";
  });

  const applyDocumentAttributes = (nextTheme: Theme, nextLocale: string) => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.lang = nextLocale;
  };

  useEffect(() => {
    applyDocumentAttributes(theme, locale);
  }, [theme, locale]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
    applyDocumentAttributes(nextTheme, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: string) => {
    setLocaleState(nextLocale);
    localStorage.setItem(STORAGE_LOCALE_KEY, nextLocale);
    applyDocumentAttributes(theme, nextLocale);
  }, [theme]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      theme,
      locale,
      isDark: theme === "dark",
      setTheme,
      setLocale,
    }),
    [theme, locale, setTheme, setLocale],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider.");
  }

  return context;
};
