"use client";

import { useState } from "react";
import Link from "next/link";
import { FileBadge, Menu, UserRound } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useGetPendingKycsQuery } from "@/lib/services/adminApi";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function KycPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data, isLoading, isError } = useGetPendingKycsQuery();

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
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <h1 className="text-2xl font-semibold text-slate-100">Pending KYC Verification</h1>
            <p className="mt-1 text-sm text-slate-300">
              Review identity submissions and verify each applicant with confidence.
            </p>
          </article>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading pending KYC records...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load pending KYC records.
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data?.map((kyc) => (
                  <article key={kyc.id} className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{kyc.user.fullName}</p>
                        <p className="text-xs text-slate-400">{kyc.user.email}</p>
                      </div>
                      <span className="rounded-full border border-amber-700/60 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-200">
                        {kyc.verificationStatus}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <FileBadge size={14} className="text-emerald-300" />
                        <span>{kyc.documentType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserRound size={14} className="text-emerald-300" />
                        <span>{kyc.data?.nationality || "N/A"}</span>
                      </div>
                      <p className="text-slate-400">
                        Submitted: {kyc.submittedAt ? dateFormat.format(new Date(kyc.submittedAt)) : "-"}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/kyc/${kyc.id}`}
                      className="mt-4 inline-flex w-full justify-center rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70"
                    >
                      Review Details
                    </Link>
                  </article>
                ))}
              </div>

              {data && data.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
                  No pending KYC documents found.
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
