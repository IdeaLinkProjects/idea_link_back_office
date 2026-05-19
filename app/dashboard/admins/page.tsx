"use client";

import { FormEvent, useState } from "react";
import { Mail, Send, UserCog, XCircle } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import {
  useGetAdminInvitationsQuery,
  useRevokeAdminInvitationMutation,
  useSendAdminInvitationMutation,
} from "@/lib/services/adminApi";

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

const statusClassName = (status: string) => {
  const normalized = status.toUpperCase();

  if (normalized === "PENDING") {
    return "border-amber-700/60 bg-amber-900/30 text-amber-200";
  }

  if (normalized === "ACCEPTED") {
    return "border-emerald-700/60 bg-emerald-900/30 text-emerald-200";
  }

  if (normalized === "EXPIRED" || normalized === "REVOKED") {
    return "border-rose-700/60 bg-rose-900/30 text-rose-200";
  }

  return "border-slate-700 bg-slate-900/60 text-slate-300";
};

export default function AdminsPage() {
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const size = 8;

  const { data, isLoading, isError, refetch } = useGetAdminInvitationsQuery({ page, size });
  const [sendInvitation, { isLoading: isSending }] = useSendAdminInvitationMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeAdminInvitationMutation();

  const handleSendInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    try {
      await sendInvitation({ email: trimmedEmail }).unwrap();
      setEmail("");
      setInviteSuccess(`Invitation sent to ${trimmedEmail}.`);
      setPage(0);
      refetch();
    } catch {
      setInviteError("Failed to send invitation. Please try again.");
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await revokeInvitation(id).unwrap();
      refetch();
    } catch {
      // Intentionally silent until toast/alerts are added globally.
    }
  };

  return (
    <AdminDashboardShell>
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-100">Admins</h2>
            <p className="mt-1 text-sm text-slate-300">
              Invite new admin users and manage pending invitations.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <h3 className="text-lg font-medium text-slate-100">Send invitation</h3>
            <p className="mt-1 text-sm text-slate-400">
              An email invitation will be sent to the address below.
            </p>

            <form onSubmit={handleSendInvitation} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    disabled={isSending}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-900/40 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Send size={16} />
                {isSending ? "Sending..." : "Send invitation"}
              </button>
            </form>

            {inviteError ? (
              <p className="mt-3 text-sm text-rose-300">{inviteError}</p>
            ) : null}
            {inviteSuccess ? (
              <p className="mt-3 text-sm text-emerald-300">{inviteSuccess}</p>
            ) : null}
          </article>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading admin invitations...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load admin invitations. Please try again.
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Invited by</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium">Expires</th>
                        <th className="px-4 py-3 font-medium">Accepted</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                      {data?.content.map((invitation) => {
                        const isPending = invitation.status.toUpperCase() === "PENDING";

                        return (
                          <tr key={invitation.id} className="transition hover:bg-slate-900/40">
                            <td className="px-4 py-3 font-medium text-slate-100">{invitation.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs ${statusClassName(invitation.status)}`}
                              >
                                {invitation.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{invitation.invitedByEmail}</td>
                            <td className="px-4 py-3 text-slate-300">{formatDate(invitation.createdAt)}</td>
                            <td className="px-4 py-3 text-slate-300">{formatDate(invitation.expiresAt)}</td>
                            <td className="px-4 py-3 text-slate-300">{formatDate(invitation.acceptedAt)}</td>
                            <td className="px-4 py-3 text-right">
                              {isPending ? (
                                <button
                                  type="button"
                                  disabled={isRevoking}
                                  onClick={() => handleRevoke(invitation.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-700/60 bg-rose-900/40 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-800/70 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <XCircle size={14} />
                                  Revoke
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">—</span>
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
                  No admin invitations found.
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-black/80 px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <UserCog size={16} className="text-emerald-300" />
                  Total invitations:{" "}
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
  );
}
