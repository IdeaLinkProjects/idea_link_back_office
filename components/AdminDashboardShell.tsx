"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

type AdminDashboardShellProps = {
  children: React.ReactNode;
};

export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="mb-3 inline-flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-100 lg:hidden"
      >
        <Menu size={16} />
        Menu
      </button>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="w-full min-w-0 lg:pl-[calc(1.5rem+16rem+1.5rem)]">
        <section className="w-full min-w-0 max-w-full space-y-4">{children}</section>
      </main>
    </div>
  );
}
