"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = [
    { label: "Occupancy Rate", value: "92%", sub: "184 of 200 units occupied" },
    { label: "Total Properties", value: "25", sub: "22 active - 3 vacant" },
    { label: "Rent Collected", value: "$182,450", sub: "$17,450 pending" },
    { label: "Open Requests", value: "8", sub: "28 resolved this week" },
  ];

  return (
    <div className="min-h-screen bg-transparent px-3 py-4 sm:px-6 sm:py-6">
      <main className="mx-auto w-full max-w-7xl">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="mb-3 inline-flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-100 lg:hidden"
        >
          <Menu size={16} />
          Menu
        </button>

        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <section className="space-y-4 lg:ml-[17.5rem]">
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-6">
            <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">Welcome to Dashboard</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              You are successfully authenticated and can access protected dashboard content.
            </p>
          </article>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-slate-400">{item.sub}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr,1fr]">
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5">
              <h3 className="text-lg font-semibold text-slate-100 sm:text-xl">Recent Activity</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="rounded-lg bg-slate-900/80 px-3 py-2">New tenant onboarded in Building A</li>
                <li className="rounded-lg bg-slate-900/80 px-3 py-2">Monthly report generated and shared</li>
                <li className="rounded-lg bg-slate-900/80 px-3 py-2">3 maintenance tickets closed today</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5">
              <h3 className="text-lg font-semibold text-slate-100 sm:text-xl">Performance Status</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                  <span className="text-emerald-300">On Track</span>
                  <span className="text-slate-100">18 projects</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                  <span className="text-amber-300">At Risk</span>
                  <span className="text-slate-100">4 projects</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2">
                  <span className="text-rose-300">Delayed</span>
                  <span className="text-slate-100">2 projects</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
