"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { formatEtb, formatEtbSigned } from "@/lib/financeFormat";
import { useGetReconcileAllQuery } from "@/lib/services/adminApi";

export default function FinanceReconciliationPage() {
  const { data, isLoading, isError, refetch, isFetching } = useGetReconcileAllQuery();
  const currency = data?.currency ?? "ETB";
  const results = data?.results ?? [];
  const mismatched = results.filter((result) => !result.matched);
  const matched = results.filter((result) => result.matched);

  return (
    <AdminDashboardShell>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-100">
              Reconciliation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              All wallets checked against their ledger totals — catch accounting drift before users
              report it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Scale size={15} />
            {isFetching ? "Checking..." : "Re-run check"}
          </button>
        </div>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Running platform reconciliation...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load reconciliation results. Please try again.
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Wallets checked
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-100">{data.totalChecked}</p>
            </article>
            <article className="rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/80">
                Matched
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">{data.matchedCount}</p>
            </article>
            <article className="rounded-2xl border border-rose-800/50 bg-rose-950/20 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-300/80">
                Mismatched
              </p>
              <p className="mt-2 text-3xl font-semibold text-rose-300">{data.mismatchedCount}</p>
            </article>
          </div>

          {mismatched.length > 0 ? (
            <article className="rounded-2xl border border-rose-700/40 bg-black/80 p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-300" />
                <h3 className="text-lg font-semibold text-rose-100">Drift detected</h3>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-rose-900/50">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-rose-900/50 bg-rose-950/40 text-xs uppercase tracking-wide text-rose-200/70">
                      <tr>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Wallet</th>
                        <th className="px-4 py-3 font-medium">Ledger</th>
                        <th className="px-4 py-3 font-medium">Difference</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-950/60 text-sm text-slate-200">
                      {mismatched.map((result) => (
                        <tr
                          key={`${result.type}-${result.ownerId}`}
                          className="bg-rose-950/20 transition hover:bg-rose-950/35"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-100">
                              {result.ownerName ?? `Owner #${result.ownerId}`}
                            </p>
                            {result.ownerEmail ? (
                              <p className="text-xs text-slate-500">{result.ownerEmail}</p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-xs text-slate-300">
                              {result.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {formatEtb(result.walletBalance, result.currency ?? currency)}
                          </td>
                          <td className="px-4 py-3">
                            {formatEtb(result.ledgerBalance, result.currency ?? currency)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-rose-300">
                            {formatEtbSigned(result.difference, result.currency ?? currency)}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/finance/wallets/${result.ownerId}/${result.type}`}
                              className="rounded-lg border border-rose-700/60 bg-rose-900/40 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-800/60"
                            >
                              Inspect wallet
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          ) : (
            <article className="rounded-2xl border border-emerald-700/40 bg-emerald-950/20 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={18} />
                <p className="text-sm font-medium">
                  All checked wallets match their ledger balances.
                </p>
              </div>
            </article>
          )}

          {matched.length > 0 ? (
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-100">Matched wallets</h3>
              <p className="mt-1 text-sm text-slate-400">
                Showing {matched.length} of {data.matchedCount} matched results returned by the API.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Balance</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                      {matched.slice(0, 25).map((result) => (
                        <tr key={`${result.type}-${result.ownerId}`} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3">
                            {result.ownerName ?? `Owner #${result.ownerId}`}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{result.type}</td>
                          <td className="px-4 py-3 text-emerald-300">
                            {formatEtb(result.walletBalance, result.currency ?? currency)}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/finance/wallets/${result.ownerId}/${result.type}`}
                              className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          ) : null}
        </>
      ) : null}
    </AdminDashboardShell>
  );
}
