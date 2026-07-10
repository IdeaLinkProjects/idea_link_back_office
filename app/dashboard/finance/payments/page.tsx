"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Link2Off,
  Unlink,
  X,
} from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import { formatEtb, getInitials } from "@/lib/financeFormat";
import { useGetLedgerPaymentsQuery } from "@/lib/services/adminApi";

const STATUS_OPTIONS = ["All", "SUCCESS", "PENDING", "FAILED"] as const;
const TYPE_OPTIONS = ["All", "TOPUP", "WITHDRAWAL"] as const;
const DIRECTION_OPTIONS = ["All", "IN", "OUT"] as const;

function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
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
  );
}

function statusTone(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "SUCCESS") {
    return "text-emerald-300";
  }
  if (normalized === "FAILED") {
    return "text-rose-300";
  }
  return "text-slate-400";
}

function FinancePaymentsContent() {
  const searchParams = useSearchParams();
  const initialMissing = searchParams.get("missingLedgerOnly") === "true";

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("All");
  const [direction, setDirection] = useState<(typeof DIRECTION_OPTIONS)[number]>("All");
  const [missingLedgerOnly, setMissingLedgerOnly] = useState(initialMissing);
  const size = 10;

  const queryArgs = useMemo(
    () => ({
      page,
      size,
      ...(status !== "All" ? { status } : {}),
      ...(type !== "All" ? { type } : {}),
      ...(direction !== "All" ? { direction } : {}),
      ...(missingLedgerOnly ? { missingLedgerOnly: true } : {}),
    }),
    [page, size, status, type, direction, missingLedgerOnly],
  );

  const { data, isLoading, isError } = useGetLedgerPaymentsQuery(queryArgs);

  const resetPage = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  };

  return (
    <>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl sm:p-6">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-100">
            Payment Records
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            Reconcile Chapa gateway payments with internal ledger entries. Identify gaps, verify
            transaction integrity, and manage payout flows.
          </p>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3">
            <FilterPills
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={resetPage(setStatus)}
            />
            <FilterPills
              label="Type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={resetPage(setType)}
            />
            <FilterPills
              label="Direction"
              options={DIRECTION_OPTIONS}
              value={direction}
              onChange={resetPage(setDirection)}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setMissingLedgerOnly((value) => !value);
              setPage(0);
            }}
            className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-medium transition ${
              missingLedgerOnly
                ? "border-rose-500/70 bg-rose-600/30 text-rose-100 shadow-[0_0_24px_rgba(185,28,28,0.25)]"
                : "border-rose-800/60 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50"
            }`}
          >
            <Link2Off size={15} />
            Missing ledger link only
          </button>
        </div>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading payment records...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load payment records. Please try again.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Ref</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Dir</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                  {data?.content.map((payment) => {
                    const missing = payment.ledgerEntryId == null;
                    const direction = (payment.paymentDirection ?? "").toUpperCase();
                    const isIn = direction === "IN";
                    const displayName = payment.userEmail || `User #${payment.userId}`;

                    return (
                      <tr
                        key={payment.id}
                        className={`transition ${
                          missing
                            ? "bg-rose-950/35 hover:bg-rose-950/50"
                            : "hover:bg-slate-900/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              missing ? "text-rose-300" : "text-emerald-300"
                            }`}
                          >
                            {payment.paymentReference}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-[10px] font-semibold text-slate-200">
                              {getInitials(displayName)}
                            </div>
                            <div>
                              <p className="text-slate-300">{payment.userEmail}</p>
                              <p className="text-xs text-slate-500">User #{payment.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-xs text-slate-300">
                            {payment.paymentType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {direction ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                isIn ? "text-emerald-300" : "text-slate-200"
                              }`}
                            >
                              {isIn ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                              {direction}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-100">
                          {formatEtb(payment.amount ?? 0, payment.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusTone(payment.paymentStatus)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {payment.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!missing ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-200">
                              <Check size={12} />
                              Linked #{payment.ledgerEntryId}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-700/60 bg-rose-900/40 px-2.5 py-1 text-xs font-medium text-rose-200">
                              <X size={12} />
                              Missing ref
                              <Unlink size={11} className="opacity-70" />
                            </span>
                          )}
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
              No payment records matched these filters.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-black/80 px-4 py-3 text-sm text-slate-300">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-100">{data?.numberOfElements ?? 0}</span> of{" "}
              <span className="font-semibold text-slate-100">
                {(data?.totalElements ?? 0).toLocaleString()}
              </span>{" "}
              records
            </span>
          </div>

          <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      ) : null}
    </>
  );
}

export default function FinancePaymentsPage() {
  return (
    <AdminDashboardShell>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
            Loading payment records...
          </div>
        }
      >
        <FinancePaymentsContent />
      </Suspense>
    </AdminDashboardShell>
  );
}
