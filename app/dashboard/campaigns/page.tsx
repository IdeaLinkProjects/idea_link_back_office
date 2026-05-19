"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import Link from "next/link";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import { useGetCampaignsQuery } from "@/lib/services/adminApi";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function CampaignsPage() {
  const [page, setPage] = useState(0);
  const size = 6;

  const { data, isLoading, isError } = useGetCampaignsQuery({ page, size });

  return (
    <AdminDashboardShell>
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-100">Campaigns</h2>
            <p className="mt-1 text-sm text-slate-300">
              Discover and manage live fundraising campaigns with real-time progress and investor stats.
            </p>
          </article>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading campaigns...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load campaigns. Please try again.
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data?.content.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl"
                  >
                    <div className="relative h-44 w-full bg-slate-900">
                      {campaign.heroImageUrl ? (
                        <img
                          src={campaign.heroImageUrl}
                          alt={campaign.title}
                          className="h-full w-full object-cover opacity-90"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          No image available
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full border border-emerald-700/60 bg-emerald-900/50 px-2.5 py-1 text-xs text-emerald-100">
                        {campaign.status}
                      </span>
                    </div>

                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-1 text-lg font-semibold text-slate-100">{campaign.title}</h3>
                      <p className="line-clamp-2 text-sm text-slate-300">{campaign.shortDescription}</p>

                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(Math.max(campaign.fundingProgress || 0, 0), 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="rounded-lg bg-slate-900/80 p-2">
                          <p className="text-slate-400">Raised</p>
                          <p className="mt-1 font-semibold text-slate-100">{currency.format(campaign.amountRaised)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2">
                          <p className="text-slate-400">Goal</p>
                          <p className="mt-1 font-semibold text-slate-100">{currency.format(campaign.fundingGoal)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2">
                          <p className="text-slate-400">Investors</p>
                          <p className="mt-1 font-semibold text-slate-100">{campaign.totalInvestors}</p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2">
                          <p className="text-slate-400">Min Invest</p>
                          <p className="mt-1 font-semibold text-slate-100">{currency.format(campaign.minInvestment)}</p>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70"
                      >
                        <Target size={15} />
                        View Campaign
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {data && data.content.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
                  No campaigns found.
                </div>
              ) : null}

              <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
            </>
          ) : null}
    </AdminDashboardShell>
  );
}
