"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Scale,
  Wallet,
} from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { formatEtb, todayIsoDate } from "@/lib/financeFormat";
import {
  useGetDailyLedgerSummaryQuery,
  useGetPlatformLedgerSummaryQuery,
} from "@/lib/services/adminApi";

function alertHref(code?: string, href?: string) {
  if (href) {
    return href;
  }

  const normalized = (code ?? "").toUpperCase();
  if (normalized.includes("PAYMENT") || normalized.includes("LEDGER_LINK")) {
    return "/dashboard/finance/payments?missingLedgerOnly=true";
  }
  if (normalized.includes("BANK")) {
    return "/dashboard/bank-accounts";
  }
  if (normalized.includes("RECON") || normalized.includes("MISMATCH")) {
    return "/dashboard/finance/reconciliation";
  }
  return "/dashboard/finance/reconciliation";
}

export default function FinanceOverviewPage() {
  const date = todayIsoDate();
  const summaryQuery = useGetPlatformLedgerSummaryQuery();
  const dailyQuery = useGetDailyLedgerSummaryQuery({ date });

  const summary = summaryQuery.data;
  const daily = dailyQuery.data;
  const healthAlerts = summary?.healthAlerts ?? [];
  const walletBreakdown = summary?.walletBreakdown ?? [];
  const movements = daily?.movements ?? [];
  const currency = summary?.currency ?? daily?.currency ?? "ETB";
  const isLoading = summaryQuery.isLoading || dailyQuery.isLoading;
  const isError = summaryQuery.isError || dailyQuery.isError;

  return (
    <AdminDashboardShell>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl sm:p-6">
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-100">
          Finance Overview
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          One-glance platform financial health — total liquidity, wallet breakdown, health alerts,
          and today&apos;s money movement.
        </p>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading finance overview...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load finance overview. Please try again.
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total liquidity
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-300">
                {formatEtb(summary.totalLiquidity ?? 0, currency)}
              </p>
              <p className="mt-2 text-xs text-slate-500">Across all platform wallets</p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Mismatched wallets
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
                {summary.mismatchedWallets ??
                  healthAlerts.filter((a) => a.severity !== "INFO").length}
              </p>
              <Link
                href="/dashboard/finance/reconciliation"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200"
              >
                <Scale size={12} />
                Open reconciliation
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Missing payment links
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
                {summary.missingPaymentLinks ?? 0}
              </p>
              <Link
                href="/dashboard/finance/payments?missingLedgerOnly=true"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-300 hover:text-rose-200"
              >
                Review payments
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Unverified bank accounts
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
                {summary.unverifiedBankAccounts ?? 0}
              </p>
              <Link
                href="/dashboard/bank-accounts"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200"
              >
                <Landmark size={12} />
                Verify accounts
              </Link>
            </article>
          </div>

          {healthAlerts.length > 0 ? (
            <article className="rounded-2xl border border-rose-700/40 bg-rose-950/30 p-4 shadow-xl sm:p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-300" />
                <h3 className="text-lg font-semibold text-rose-100">Health alerts</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {healthAlerts.map((alert, index) => (
                  <li key={`${alert.code ?? alert.message}-${index}`}>
                    <Link
                      href={
                        alert.ownerId && alert.walletType
                          ? `/dashboard/finance/wallets/${alert.ownerId}/${alert.walletType}`
                          : alertHref(alert.code, alert.href)
                      }
                      className="flex items-start justify-between gap-3 rounded-xl border border-rose-800/50 bg-black/40 px-3 py-2.5 text-sm transition hover:bg-rose-950/50"
                    >
                      <span className="text-rose-100">{alert.message}</span>
                      {typeof alert.count === "number" ? (
                        <span className="shrink-0 rounded-full border border-rose-700/60 bg-rose-900/40 px-2 py-0.5 text-xs text-rose-200">
                          {alert.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-100">Wallet breakdown</h3>
                <Link
                  href="/dashboard/finance/wallets"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                >
                  <Wallet size={12} />
                  View wallets
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {walletBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-400">No wallet balances reported.</p>
                ) : (
                  walletBreakdown.map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {item.label ?? item.type}
                        </p>
                        <p className="text-xs text-slate-500">{item.count.toLocaleString()} wallets</p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">
                        {formatEtb(item.balance, item.currency ?? currency)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-100">Today&apos;s money movement</h3>
                <p className="text-xs text-slate-500">{date}</p>
              </div>

              {daily ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-3 py-2.5">
                      <p className="inline-flex items-center gap-1 text-xs text-emerald-300">
                        <ArrowDownLeft size={12} /> In
                      </p>
                      <p className="mt-1 text-lg font-semibold text-emerald-200">
                        {formatEtb(daily.totalIn ?? 0, daily.currency ?? currency)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5">
                      <p className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <ArrowUpRight size={12} /> Out
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-100">
                        {formatEtb(daily.totalOut ?? 0, daily.currency ?? currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Activity</th>
                          <th className="px-3 py-2 font-medium">Dir</th>
                          <th className="px-3 py-2 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {movements.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-4 text-slate-400">
                              No money movement recorded for today.
                            </td>
                          </tr>
                        ) : (
                          movements.map((movement, index) => {
                            const isIn = (movement.direction ?? "").toUpperCase() === "IN";
                            return (
                              <tr key={`${movement.label}-${index}`}>
                                <td className="px-3 py-2.5">
                                  <p className="font-medium text-slate-100">{movement.label}</p>
                                  {movement.type ? (
                                    <p className="text-xs text-slate-500">{movement.type}</p>
                                  ) : null}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                                      isIn ? "text-emerald-300" : "text-slate-300"
                                    }`}
                                  >
                                    {isIn ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                    {(movement.direction ?? "—").toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right font-medium text-slate-100">
                                  {formatEtb(movement.amount ?? 0, movement.currency ?? currency)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-400">Daily activity unavailable.</p>
              )}
            </article>
          </div>
        </>
      ) : null}
    </AdminDashboardShell>
  );
}
