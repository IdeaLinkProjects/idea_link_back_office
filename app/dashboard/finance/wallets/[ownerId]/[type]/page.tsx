"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import {
  formatEtb,
  formatEtbSigned,
  formatLedgerTimestamp,
} from "@/lib/financeFormat";
import {
  useGetLedgerWalletQuery,
  useGetWalletReconcileQuery,
} from "@/lib/services/adminApi";

function referenceLabel(entry: {
  referenceLabel?: string;
  referenceType?: string;
  referenceId?: number | string;
}) {
  return (
    entry.referenceLabel ??
    (entry.referenceType
      ? `${entry.referenceType}${entry.referenceId != null ? ` #${entry.referenceId}` : ""}`
      : "—")
  );
}

export default function WalletDetailPage() {
  const params = useParams<{ ownerId: string; type: string }>();
  const [page, setPage] = useState(0);
  const size = 20;

  const ownerId = useMemo(() => Number(params.ownerId), [params.ownerId]);
  const walletType = decodeURIComponent(params.type ?? "");

  const { data, isLoading, isError, refetch, isFetching } = useGetLedgerWalletQuery(
    { ownerId, type: walletType, page, size },
    { skip: Number.isNaN(ownerId) || !walletType },
  );

  const {
    data: reconcile,
    isFetching: isReconciling,
    refetch: refetchReconcile,
  } = useGetWalletReconcileQuery(
    { ownerId, type: walletType },
    { skip: Number.isNaN(ownerId) || !walletType },
  );

  const currency = data?.currency ?? reconcile?.currency ?? "ETB";
  const entries = data?.entries ?? [];
  const totalPages = data?.totalPages ?? (entries.length > 0 ? 1 : 0);

  const handleReconcile = async () => {
    try {
      await Promise.all([refetchReconcile(), refetch()]);
    } catch {
      // Intentionally silent until toast/alerts are added globally.
    }
  };

  return (
    <AdminDashboardShell>
      <Link
        href="/dashboard/finance/wallets"
        className="inline-flex items-center gap-2 text-sm text-emerald-300 transition hover:text-emerald-200"
      >
        <ArrowLeft size={15} />
        Back to Wallets
      </Link>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading wallet detail...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load wallet detail. Please try again.
        </div>
      ) : null}

      {data ? (
        <>
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300">
                  <UserRound size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold text-slate-100">{data.ownerName}</h2>
                    {data.status ? (
                      <span className="rounded-full border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                        {data.status}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {data.ownerEmail ? `${data.ownerEmail} · ` : null}
                    {data.type} wallet · Owner ID #{data.ownerId}
                  </p>
                </div>
              </div>

              <div className="lg:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current balance
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-emerald-300">
                  {formatEtb(data.balance, currency)}
                </p>
                <button
                  type="button"
                  onClick={handleReconcile}
                  disabled={isReconciling || isFetching}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-600/70 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={isReconciling ? "animate-spin" : undefined}
                  />
                  Reconcile now
                </button>
              </div>
            </div>
          </article>

          {reconcile && !reconcile.matched ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-700/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-100 shadow-xl">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <p>
                {reconcile.message ??
                  `Wallet balance ${formatEtb(reconcile.walletBalance, currency)} does not match ledger ${formatEtb(reconcile.ledgerBalance, currency)} — Difference ${formatEtbSigned(reconcile.difference, currency)}`}
              </p>
            </div>
          ) : null}

          {reconcile?.matched ? (
            <div className="rounded-2xl border border-emerald-700/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
              Wallet balance matches ledger ({formatEtb(reconcile.walletBalance, currency)}).
            </div>
          ) : null}

          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100">Ledger entries</h3>
            <p className="mt-1 text-sm text-slate-400">
              Audit trail for this wallet — debug balance issues for one user, company, or campaign.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Balance after</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                    {entries.map((entry) => {
                      const isCredit = (entry.entryType ?? "").toUpperCase() === "CREDIT";
                      const label = referenceLabel(entry);

                      return (
                        <tr key={entry.id} className="transition hover:bg-slate-900/40">
                          <td className="px-4 py-3 text-slate-400">
                            {formatLedgerTimestamp(entry.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                isCredit
                                  ? "border-emerald-700/60 bg-emerald-900/40 text-emerald-200"
                                  : "border-rose-700/60 bg-rose-900/40 text-rose-200"
                              }`}
                            >
                              {entry.entryType}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold ${
                              isCredit ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {formatEtbSigned(
                              isCredit ? Math.abs(entry.amount) : -Math.abs(entry.amount),
                              entry.currency ?? currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{label}</td>
                          <td className="px-4 py-3 text-slate-200">
                            {formatEtb(entry.balanceAfter, entry.currency ?? currency)}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{entry.description ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {entries.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No ledger entries for this wallet.</p>
            ) : null}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </article>
        </>
      ) : null}
    </AdminDashboardShell>
  );
}
