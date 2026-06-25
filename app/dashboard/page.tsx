"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Banknote,
  Building2,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { useGetDashboardSummaryQuery } from "@/lib/services/adminApi";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardSummaryQuery();

  const kpiCards = data
    ? [
        {
          label: "Total Users",
          value: data.users.total.toLocaleString(),
          sub: `${data.users.activeUsers} active · ${data.users.inactiveUsers} inactive`,
          icon: Users,
        },
        {
          label: "Total Raised",
          value: currency.format(data.campaigns.totalRaised),
          sub: `${data.campaigns.totalCampaigns} campaigns · ${percent.format(data.campaigns.successRate)} success rate`,
          icon: TrendingUp,
        },
        {
          label: "Investment Volume",
          value: currency.format(data.platform.totalInvestmentVolume),
          sub: `${data.platform.totalCompletedInvestments} completed investments`,
          icon: Banknote,
        },
        {
          label: "Companies",
          value: data.platform.totalCompanies.toLocaleString(),
          sub: `${data.platform.unverifiedCompanies} awaiting verification`,
          icon: Building2,
        },
      ]
    : [];

  const queueItems = data
    ? [
        {
          label: "Campaign reviews",
          count: data.queues.pendingCampaignReviews,
          href: "/dashboard/campaigns",
          icon: Megaphone,
          tone: "emerald" as const,
        },
        {
          label: "KYC documents",
          count: data.queues.pendingKycDocuments,
          href: "/dashboard/kyc",
          icon: ShieldCheck,
          tone: "amber" as const,
        },
        {
          label: "Unverified companies",
          count: data.queues.unverifiedCompanies,
          href: "/dashboard/bank-accounts",
          icon: Building2,
          tone: "rose" as const,
        },
        {
          label: "Ready for payout",
          count: data.queues.readyForPayout,
          href: "/dashboard/campaigns",
          icon: Banknote,
          tone: "sky" as const,
        },
      ]
    : [];

  const toneClasses = {
    emerald: "border-emerald-700/60 bg-emerald-900/30 text-emerald-200",
    amber: "border-amber-700/60 bg-amber-900/30 text-amber-200",
    rose: "border-rose-700/60 bg-rose-900/30 text-rose-200",
    sky: "border-sky-700/60 bg-sky-900/30 text-sky-200",
  };

  return (
    <AdminDashboardShell>
      <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-6">
        <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">Admin Dashboard</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Platform overview with KPIs, review queues, and the latest items needing attention.
        </p>
      </article>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
          Loading dashboard summary...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          Failed to load dashboard summary. Please try again.
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">{item.label}</p>
                  <item.icon size={16} className="shrink-0 text-emerald-300" />
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-slate-400">{item.sub}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr,2fr]">
            <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5">
              <h3 className="text-lg font-semibold text-slate-100 sm:text-xl">Review Queues</h3>
              <div className="mt-3 space-y-2">
                {queueItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm transition hover:bg-slate-800/80"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <item.icon size={15} className="text-emerald-300" />
                      {item.label}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[item.tone]}`}
                    >
                      {item.count}
                    </span>
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5">
              <h3 className="text-lg font-semibold text-slate-100 sm:text-xl">User Breakdown</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                  <p className="text-slate-400">Investors</p>
                  <p className="mt-1 font-semibold text-slate-100">{data.users.investors}</p>
                </div>
                <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                  <p className="text-slate-400">Innovators</p>
                  <p className="mt-1 font-semibold text-slate-100">{data.users.innovators}</p>
                </div>
                <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                  <p className="text-slate-400">Admins</p>
                  <p className="mt-1 font-semibold text-slate-100">{data.users.admins}</p>
                </div>
                <div className="rounded-lg bg-slate-900/80 px-3 py-2">
                  <p className="text-slate-400">Verified KYC</p>
                  <p className="mt-1 font-semibold text-slate-100">{data.users.verifiedKyc}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {data.users.pendingKyc} users with pending KYC verification
              </p>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PreviewSection
              title="Pending Campaign Reviews"
              emptyMessage="No campaigns awaiting review."
              viewAllHref="/dashboard/campaigns"
              isEmpty={data.previews.pendingCampaigns.length === 0}
            >
              {data.previews.pendingCampaigns.map((campaign) => (
                <PreviewRow
                  key={campaign.id}
                  title={campaign.title}
                  subtitle={campaign.companyName}
                  meta={`Goal ${currency.format(campaign.fundingGoal)} · ${dateFormat.format(new Date(campaign.submittedAt))}`}
                  href={`/dashboard/campaigns/${campaign.id}`}
                />
              ))}
            </PreviewSection>

            <PreviewSection
              title="Pending KYC"
              emptyMessage="No pending KYC submissions."
              viewAllHref="/dashboard/kyc"
              isEmpty={data.previews.pendingKyc.length === 0}
            >
              {data.previews.pendingKyc.map((kyc) => (
                <PreviewRow
                  key={kyc.kycId}
                  title={kyc.userEmail}
                  subtitle={kyc.documentType}
                  meta={dateFormat.format(new Date(kyc.submittedAt))}
                  href={`/dashboard/kyc/${kyc.kycId}`}
                />
              ))}
            </PreviewSection>

            <PreviewSection
              title="Unverified Companies"
              emptyMessage="No unverified companies."
              viewAllHref="/dashboard/bank-accounts"
              isEmpty={data.previews.unverifiedCompanies.length === 0}
            >
              {data.previews.unverifiedCompanies.map((company) => (
                <PreviewRow
                  key={company.id}
                  title={company.name}
                  subtitle={company.industry}
                  meta={dateFormat.format(new Date(company.createdAt))}
                />
              ))}
            </PreviewSection>

            <PreviewSection
              title="Ready for Payout"
              emptyMessage="No campaigns ready for payout."
              viewAllHref="/dashboard/campaigns"
              isEmpty={data.previews.readyForPayout.length === 0}
            >
              {data.previews.readyForPayout.map((campaign) => (
                <PreviewRow
                  key={campaign.campaignId}
                  title={campaign.title}
                  subtitle={campaign.companyName}
                  meta={`${currency.format(campaign.amountRaised)} raised · ${dateFormat.format(new Date(campaign.fundedAt))}`}
                  href={`/dashboard/campaigns/${campaign.campaignId}`}
                />
              ))}
            </PreviewSection>
          </div>
        </>
      ) : null}
    </AdminDashboardShell>
  );
}

type PreviewSectionProps = {
  title: string;
  emptyMessage: string;
  viewAllHref: string;
  isEmpty: boolean;
  children: ReactNode;
};

function PreviewSection({ title, emptyMessage, viewAllHref, isEmpty, children }: PreviewSectionProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-black/80 p-4 shadow-xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <Link
          href={viewAllHref}
          className="text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
        >
          View all
        </Link>
      </div>
      {!isEmpty ? (
        <ul className="mt-3 space-y-2">{children}</ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{emptyMessage}</p>
      )}
    </article>
  );
}

type PreviewRowProps = {
  title: string;
  subtitle: string;
  meta: string;
  href?: string;
};

function PreviewRow({ title, subtitle, meta, href }: PreviewRowProps) {
  const content = (
    <>
      <p className="truncate font-medium text-slate-100">{title}</p>
      <p className="truncate text-xs text-slate-400">{subtitle}</p>
      <p className="mt-1 text-xs text-slate-500">{meta}</p>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="block rounded-lg bg-slate-900/80 px-3 py-2 text-sm transition hover:bg-slate-800/80"
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm">{content}</li>;
}
