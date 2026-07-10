"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Landmark } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import {
  useGetUnverifiedBankAccountsQuery,
  useVerifyBankAccountMutation,
} from "@/lib/services/adminApi";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function BankAccountsPage() {
  const [page, setPage] = useState(0);
  const [pendingVerifyId, setPendingVerifyId] = useState<number | null>(null);
  const size = 8;

  const { data, isLoading, isError, refetch } = useGetUnverifiedBankAccountsQuery({ page, size });
  const [verifyBankAccount, { isLoading: isVerifying }] = useVerifyBankAccountMutation();

  const pendingAccount = data?.content.find((account) => account.id === pendingVerifyId);

  const handleConfirmVerify = async () => {
    if (pendingVerifyId === null) {
      return;
    }

    try {
      await verifyBankAccount(pendingVerifyId).unwrap();
      setPendingVerifyId(null);
      await refetch();
    } catch {
      // Intentionally silent until toast/alerts are added globally.
    }
  };

  return (
    <>
    <AdminDashboardShell>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Bank Account</h2>
            <p className="mt-1 text-sm text-slate-300">
              Review company bank accounts pending admin verification and approval.
            </p>
          </div>
          <Link
            href="/dashboard/finance"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-800/70"
          >
            Finance overview
          </Link>
        </div>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading pending bank accounts...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load pending bank accounts. Please try again.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Founder</th>
                    <th className="px-4 py-3 font-medium">Account Holder</th>
                    <th className="px-4 py-3 font-medium">Bank Code</th>
                    <th className="px-4 py-3 font-medium">Account Number</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                  {data?.content.map((account) => (
                    <tr key={account.id} className="transition hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">{account.companyName}</p>
                            <p className="text-xs text-slate-500">ID: {account.companyId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{account.founderEmail}</td>
                      <td className="px-4 py-3 text-slate-300">{account.accountHolderName}</td>
                      <td className="px-4 py-3 text-slate-300">{account.bankCode}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {account.maskedAccountNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {account.submittedAt
                          ? dateFormat.format(new Date(account.submittedAt))
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-amber-700/60 bg-amber-900/30 px-2 py-0.5 text-xs text-amber-200">
                          {account.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!account.verified ? (
                          <button
                            type="button"
                            onClick={() => setPendingVerifyId(account.id)}
                            disabled={isVerifying}
                            className="rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Verify
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.content.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              No pending bank accounts found.
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-black/80 px-4 py-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Landmark size={16} className="text-emerald-300" />
              Total pending:{" "}
              <span className="font-semibold text-slate-100">{data?.totalElements ?? 0}</span>
            </span>
            <span>
              Showing:{" "}
              <span className="font-semibold text-slate-100">{data?.numberOfElements ?? 0}</span>
            </span>
          </div>

          <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      ) : null}
    </AdminDashboardShell>

      <ConfirmModal
        isOpen={pendingVerifyId !== null}
        title="Verify bank account?"
        description={
          pendingAccount
            ? `Approve the bank account for ${pendingAccount.companyName} (${pendingAccount.maskedAccountNumber}) for payouts.`
            : "Approve this bank account for payouts."
        }
        confirmText="Verify"
        confirmVariant="approve"
        isLoading={isVerifying}
        onCancel={() => setPendingVerifyId(null)}
        onConfirm={handleConfirmVerify}
      />
    </>
  );
}
