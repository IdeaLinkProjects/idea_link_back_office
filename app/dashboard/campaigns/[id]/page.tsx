"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CAMPAIGN_STATUS } from "@/lib/constants";
import {
  useApproveCampaignMutation,
  useGetCampaignByIdQuery,
  useReleaseEscrowFundsMutation,
  useRejectCampaignMutation,
  useVerifyCampaignDocumentMutation,
} from "@/lib/services/adminApi";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | "release" | null>(null);
  const [verifyingDocumentId, setVerifyingDocumentId] = useState<number | null>(null);

  const campaignId = useMemo(() => Number(params.id), [params.id]);
  const { data, isLoading, isError, refetch } = useGetCampaignByIdQuery(campaignId, {
    skip: Number.isNaN(campaignId),
  });
  const [approveCampaign, { isLoading: isApproving }] = useApproveCampaignMutation();
  const [rejectCampaign, { isLoading: isRejecting }] = useRejectCampaignMutation();
  const [releaseEscrowFunds, { isLoading: isReleasing }] = useReleaseEscrowFundsMutation();
  const [verifyCampaignDocument] = useVerifyCampaignDocumentMutation();

  const isPendingReview = data?.status === CAMPAIGN_STATUS.PENDING_REVIEW;
  const isReadyForPayout = data?.status === CAMPAIGN_STATUS.READY_FOR_PAYOUT;
  const isActionLoading = isApproving || isRejecting || isReleasing;
  const documents = data?.documents ?? [];
  const allDocumentsVerified =
    documents.length > 0 &&
    documents.every((doc) => {
      return doc.verificationStatus?.toUpperCase().includes("VERIFIED");
    });

  const handleVerifyDocument = async (documentId: number) => {
    if (Number.isNaN(campaignId)) {
      return;
    }

    try {
      setVerifyingDocumentId(documentId);
      await verifyCampaignDocument({
        campaignId,
        documentId,
        approved: true,
        rejectionReason: "",
      }).unwrap();
      await refetch();
    } finally {
      setVerifyingDocumentId(null);
    }
  };

  const closeModal = () => {
    if (isActionLoading) {
      return;
    }

    setPendingAction(null);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || Number.isNaN(campaignId)) {
      return;
    }

    try {
      if (pendingAction === "approve") {
        await approveCampaign(campaignId).unwrap();
      } else if (pendingAction === "reject") {
        await rejectCampaign(campaignId).unwrap();
      } else {
        await releaseEscrowFunds(campaignId).unwrap();
      }

      setPendingAction(null);
      await refetch();
    } catch {
      setPendingAction(null);
    }
  };

  return (
    <>
      <AdminDashboardShell>
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-black/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            <ArrowLeft size={15} />
            Back to campaigns
          </Link>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading campaign details...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load campaign details.
            </div>
          ) : null}

          {data ? (
            <>
              <article className="overflow-hidden rounded-2xl border border-slate-800 bg-black/80 shadow-xl">
                <div className="relative h-56 w-full bg-slate-900 sm:h-72 lg:h-80">
                  {data.heroImageUrl ? (
                    <img src={data.heroImageUrl} alt={data.title} className="h-full w-full object-cover opacity-90" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">No image available</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6">
                    <span className="inline-flex rounded-full border border-emerald-700/60 bg-emerald-900/50 px-3 py-1 text-xs text-emerald-100">
                      {data.status}
                    </span>
                    <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{data.title}</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-base">{data.shortDescription}</p>
                  </div>
                </div>
              </article>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl xl:col-span-2">
                  <h2 className="text-xl font-semibold text-slate-100">Campaign Overview</h2>
                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Math.max(data.fundingProgress || 0, 0), 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Funding Progress: {data.fundingProgress ?? 0}%</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Amount Raised</p>
                      <p className="mt-1 font-semibold text-slate-100">{currency.format(data.amountRaised)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Funding Goal</p>
                      <p className="mt-1 font-semibold text-slate-100">{currency.format(data.fundingGoal)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Valuation</p>
                      <p className="mt-1 font-semibold text-slate-100">{currency.format(data.valuation)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Equity Offered</p>
                      <p className="mt-1 font-semibold text-slate-100">{data.equityOffered}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Min Investment</p>
                      <p className="mt-1 font-semibold text-slate-100">{currency.format(data.minInvestment)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-slate-400">Total Investors</p>
                      <p className="mt-1 font-semibold text-slate-100">{data.totalInvestors}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <p className="text-xs text-slate-400">Start Date</p>
                      <p className="mt-1 text-sm text-slate-100">
                        {data.startDate ? dateFormat.format(new Date(data.startDate)) : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <p className="text-xs text-slate-400">End Date</p>
                      <p className="mt-1 text-sm text-slate-100">
                        {data.endDate ? dateFormat.format(new Date(data.endDate)) : "-"}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h2 className="text-xl font-semibold text-slate-100">Company</h2>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{data.company?.name ?? "-"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-xs text-slate-400">Industry</p>
                      <p className="mt-1 text-sm text-slate-100">{data.company?.industry ?? "-"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 p-3">
                      <p className="text-xs text-slate-400">Website</p>
                      <p className="mt-1 text-sm text-slate-100 break-all">{data.company?.website ?? "-"}</p>
                    </div>
                  </div>
                </article>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-100">Tags</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(data.tags ?? []).length ? (
                      data.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-1 text-xs text-emerald-100"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No tags</p>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-100">Documents</h3>
                  <div className="mt-3 space-y-2">
                    {(data.documents ?? []).length ? (
                      data.documents?.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-slate-200 transition hover:text-emerald-300"
                            >
                              {doc.documentName}
                            </a>
                            <span className="text-xs text-emerald-300">
                              {doc.verificationStatus}
                            </span>
                          </div>

                          {isPendingReview &&
                          !doc.verificationStatus?.toUpperCase().includes("VERIFIED") ? (
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => void handleVerifyDocument(doc.id)}
                                disabled={verifyingDocumentId === doc.id}
                                className="rounded-md border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {verifyingDocumentId === doc.id ? "Verifying..." : "Verify document"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No documents available</p>
                    )}
                  </div>
                </article>
              </div>

              {isPendingReview ? (
                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-100">Review Actions</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    This campaign is pending review. Choose an action to continue.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setPendingAction("approve")}
                      disabled={!allDocumentsVerified}
                      className="rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingAction("reject")}
                      className="rounded-lg border border-rose-700/60 bg-rose-900/40 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-800/70"
                    >
                      Reject
                    </button>
                  </div>
                  {!allDocumentsVerified ? (
                    <p className="mt-3 text-xs text-amber-300">
                      Verify all documents before approving this campaign.
                    </p>
                  ) : null}
                </article>
              ) : null}

              {isReadyForPayout ? (
                <article className="rounded-2xl border border-amber-700/40 bg-black/80 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-100">Release Escrow Funds</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    This campaign has passed the cooling-off period and is ready for payout. Confirm to release
                    escrow funds to the company.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-sm text-slate-200">
                      Funding Goal:{" "}
                      <span className="font-semibold text-slate-100">{currency.format(data.fundingGoal)}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      Amount Raised:{" "}
                      <span className="font-semibold text-slate-100">{currency.format(data.amountRaised)}</span>
                    </p>
                    <p className="mt-2 text-xs text-emerald-300">
                      Campaign is eligible for escrow release.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setPendingAction("release")}
                      className="rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70"
                    >
                      Release Funds
                    </button>
                  </div>
                </article>
              ) : null}
            </>
          ) : null}
      </AdminDashboardShell>

      <ConfirmModal
        isOpen={pendingAction !== null}
        title={
          pendingAction === "approve"
            ? "Approve campaign?"
            : pendingAction === "reject"
              ? "Reject campaign?"
              : "Release escrow funds?"
        }
        description={
          pendingAction === "approve"
            ? "This action will approve the campaign and make it ready for the next stage."
            : pendingAction === "reject"
              ? "This action will reject the campaign. Please confirm you want to continue."
              : "This will release escrow funds to the company. This action cannot be undone."
        }
        confirmText={
          pendingAction === "approve" ? "Approve" : pendingAction === "reject" ? "Reject" : "Release Funds"
        }
        confirmVariant={pendingAction === "reject" ? "reject" : "approve"}
        isLoading={isActionLoading}
        onCancel={closeModal}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
