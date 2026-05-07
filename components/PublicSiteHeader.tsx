"use client";

import { Bell, Moon, Search, Settings, Sun } from "lucide-react";
import clsx from "clsx";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

export function PublicSiteHeader() {
  const { isDark, setTheme } = useAppPreferences();

  return (
    <header className="sticky top-4 z-30 rounded-2xl border border-slate-800 bg-black/80 px-5 py-4 shadow-xl backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 md:flex">
            <Search size={16} />
            <span className="text-slate-300">Search</span>
          </div>
          <button
            type="button"
            className="rounded-xl border border-emerald-700/60 bg-emerald-900/40 p-2 text-emerald-100 transition-colors hover:bg-emerald-800/70"
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            className="rounded-xl border border-emerald-700/60 bg-emerald-900/40 p-2 text-emerald-100 transition-colors hover:bg-emerald-800/70"
          >
            <Bell size={16} />
          </button>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              "bg-emerald-700 text-emerald-50 hover:bg-emerald-600",
            )}
          >
            <Sun size={16} className="hidden dark:inline" />
            <Moon size={16} className="inline dark:hidden" />
            Theme
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-900">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
