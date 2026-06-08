"use client";

import { useState } from "react";
import { Banknote, Target } from "lucide-react";
import Link from "next/link";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { Pagination } from "@/components/Pagination";
import {
  useGetCampaignsQuery,
  useGetCampaignsReadyForPayoutQuery,
} from "@/lib/services/adminApi";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type CampaignView = "all" | "ready-for-payout";

export default function CampaignsPage() {
  const [page, setPage] = useState(0);
  const [view, setView] = useState<CampaignView>("all");
  const size = 6;

  const allCampaignsQuery = useGetCampaignsQuery({ page, size }, { skip: view !== "all" });
  const readyForPayoutQuery = useGetCampaignsReadyForPayoutQuery(
    { page, size },
    { skip: view !== "ready-for-payout" },
  );

  const { data, isLoading, isError } = view === "all" ? allCampaignsQuery : readyForPayoutQuery;

  const handleViewChange = (nextView: CampaignView) => {
    setView(nextView);
    setPage(0);
  };

  return (
    <AdminDashboardShell>
          <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Campaigns</h2>
                <p className="mt-1 text-sm text-slate-300">
                  {view === "all"
                    ? "Discover and manage live fundraising campaigns with real-time progress and investor stats."
                    : "Campaigns with cooling-off passed and escrow balance ready for fund release."}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleViewChange("all")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    view === "all"
                      ? "border-emerald-700/60 bg-emerald-900/40 text-emerald-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  All campaigns
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange("ready-for-payout")}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    view === "ready-for-payout"
                      ? "border-amber-700/60 bg-amber-900/40 text-amber-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <Banknote size={15} />
                  Ready for release
                </button>
              </div>
            </div>
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
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-700/60 bg-emerald-900/50 px-2.5 py-1 text-xs text-emerald-100">
                          {campaign.status}
                        </span>
                        {view === "ready-for-payout" ? (
                          <span className="rounded-full border border-amber-700/60 bg-amber-900/50 px-2.5 py-1 text-xs text-amber-100">
                            Ready for release
                          </span>
                        ) : null}
                      </div>
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
                  {view === "ready-for-payout"
                    ? "No campaigns are ready for fund release."
                    : "No campaigns found."}
                </div>
              ) : null}

              <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
            </>
          ) : null}
    </AdminDashboardShell>
  );
}
