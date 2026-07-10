"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Wallet } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import { formatEtb, formatLedgerTimestamp, getInitials } from "@/lib/financeFormat";
import { useGetLedgerWalletsQuery } from "@/lib/services/adminApi";

const WALLET_TYPES = ["All", "USER", "COMPANY", "ESCROW", "PLATFORM"] as const;

export default function FinanceWalletsPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<(typeof WALLET_TYPES)[number]>("All");
  const size = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useGetLedgerWalletsQuery({
    page,
    size,
    ...(search ? { search } : {}),
    ...(type !== "All" ? { type } : {}),
  });

  return (
    <AdminDashboardShell>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl sm:p-6">
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-100">Wallets</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          Searchable list of all wallets with owner names — find an ownerId without digging through
          Users or Campaigns.
        </p>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by owner name, email, or ID"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none ring-emerald-600/40 placeholder:text-slate-500 focus:ring-2"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {WALLET_TYPES.map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setType(option);
                    setPage(0);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading wallets...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load wallets. Please try again.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Owner ID</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                  {data?.content.map((wallet) => {
                    const displayName =
                      wallet.ownerName || wallet.ownerLabel || `Owner #${wallet.ownerId}`;
                    const showLabel =
                      wallet.ownerLabel &&
                      wallet.ownerLabel !== wallet.ownerName &&
                      wallet.ownerLabel.length > 0;

                    return (
                      <tr
                        key={wallet.walletId}
                        className="transition hover:bg-slate-900/40"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/finance/wallets/${wallet.ownerId}/${wallet.ownerType}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-xs font-semibold text-emerald-200">
                              {getInitials(displayName)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-100 hover:text-emerald-200">
                                {displayName}
                              </p>
                              {showLabel ? (
                                <p className="text-xs text-slate-500">{wallet.ownerLabel}</p>
                              ) : null}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-xs text-slate-300">
                            {wallet.ownerType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          #{wallet.ownerId}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-300">
                          {formatEtb(wallet.availableBalance ?? 0, wallet.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${
                              wallet.isActive
                                ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                : "border-slate-700 bg-slate-900/60 text-slate-400"
                            }`}
                          >
                            {wallet.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {wallet.updatedAt ? formatLedgerTimestamp(wallet.updatedAt) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.content.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              No wallets matched your search.
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-black/80 px-4 py-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Wallet size={16} className="text-emerald-300" />
              Showing{" "}
              <span className="font-semibold text-slate-100">{data?.numberOfElements ?? 0}</span> of{" "}
              <span className="font-semibold text-slate-100">
                {(data?.totalElements ?? 0).toLocaleString()}
              </span>{" "}
              wallets
            </span>
          </div>

          <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      ) : null}
    </AdminDashboardShell>
  );
}
