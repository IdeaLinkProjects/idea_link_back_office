"use client";

import { useState } from "react";
import { Menu, UserRound, UsersRound } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination } from "@/components/Pagination";
import { useGetUsersQuery, useUpdateUserStatusMutation } from "@/lib/services/adminApi";

export default function UsersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 8;

  const { data, isLoading, isError, refetch } = useGetUsersQuery({ page, size });
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();

  const handleToggleStatus = async (userId: number, isActive: boolean | undefined) => {
    if (typeof isActive !== "boolean") {
      return;
    }

    try {
      await updateUserStatus({ userId, active: !isActive }).unwrap();
      refetch();
    } catch {
      // Intentionally silent until toast/alerts are added globally.
    }
  };

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
            <h2 className="text-2xl font-semibold text-slate-100">Users</h2>
            <p className="mt-1 text-sm text-slate-300">
              View registered users, track account types, and manage activation status.
            </p>
          </article>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading users...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load users. Please try again.
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Roles</th>
                        <th className="px-4 py-3 font-medium">Verification</th>
                        <th className="px-4 py-3 font-medium">KYC</th>
                        <th className="px-4 py-3 font-medium">Profile</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                      {data?.content.map((user) => (
                        <tr key={user.id} className="transition hover:bg-slate-900/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.profilePictureUrl ? (
                                <img
                                  src={user.profilePictureUrl}
                                  alt={user.fullName ?? `${user.firstName} ${user.lastName}`}
                                  className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300">
                                  <UserRound size={16} />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-100">
                                  {user.fullName ?? `${user.firstName} ${user.lastName}`}
                                </p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                                <p className="text-xs text-slate-500">{user.phone || "No phone"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              {user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <span
                                    key={`${user.id}-${role}`}
                                    className="rounded-full border border-cyan-700/60 bg-cyan-900/30 px-2 py-0.5 text-cyan-200"
                                  >
                                    {role}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-slate-300">
                                  No roles
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span
                                className={`rounded-full border px-2 py-0.5 ${
                                  user.emailVerified
                                    ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                    : "border-rose-700/60 bg-rose-900/30 text-rose-200"
                                }`}
                              >
                                Email {user.emailVerified ? "Verified" : "Unverified"}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 ${
                                  user.phoneVerified
                                    ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                    : "border-rose-700/60 bg-rose-900/30 text-rose-200"
                                }`}
                              >
                                Phone {user.phoneVerified ? "Verified" : "Unverified"}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 ${
                                  user.fanVerified
                                    ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                    : "border-rose-700/60 bg-rose-900/30 text-rose-200"
                                }`}
                              >
                                Fan {user.fanVerified ? "Verified" : "Unverified"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                user.kycStatus === "VERIFIED"
                                  ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                  : "border-amber-700/60 bg-amber-900/30 text-amber-200"
                              }`}
                            >
                              {user.kycStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${
                                user.isProfileComplete
                                  ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200"
                                  : "border-amber-700/60 bg-amber-900/30 text-amber-200"
                              }`}
                            >
                              {user.isProfileComplete ? "Complete" : "Incomplete"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-400">ID: {user.id}</span>
                              <button
                                type="button"
                                disabled={isUpdatingStatus || typeof user.active !== "boolean"}
                                onClick={() => handleToggleStatus(user.id, user.active)}
                                className="rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {typeof user.active === "boolean"
                                  ? user.active
                                    ? "Deactivate"
                                    : "Activate"
                                  : "No status"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data && data.content.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
                  No users found.
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-black/80 px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <UsersRound size={16} className="text-emerald-300" />
                  Total users: <span className="font-semibold text-slate-100">{data?.totalElements ?? 0}</span>
                </span>
                <span>
                  Showing: <span className="font-semibold text-slate-100">{data?.numberOfElements ?? 0}</span>
                </span>
              </div>

              <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
