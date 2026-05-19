"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useGetPendingKycsQuery, useVerifyKycMutation } from "@/lib/services/adminApi";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function KycDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const kycId = useMemo(() => Number(params.id), [params.id]);
  const { data, isLoading, isError, refetch } = useGetPendingKycsQuery();
  const [verifyKyc, { isLoading: isVerifying }] = useVerifyKycMutation();

  const record = useMemo(() => data?.find((item) => item.id === kycId), [data, kycId]);

  const handleConfirm = async () => {
    if (!pendingAction || Number.isNaN(kycId)) {
      return;
    }

    if (pendingAction === "reject" && !rejectionReason.trim()) {
      return;
    }

    await verifyKyc({
      kycId,
      approved: pendingAction === "approve",
      rejectionReason: pendingAction === "reject" ? rejectionReason.trim() : "",
    }).unwrap();

    setPendingAction(null);
    setRejectionReason("");
    await refetch();
    router.push("/dashboard/kyc");
  };

  return (
    <>
      <AdminDashboardShell>
          <Link
            href="/dashboard/kyc"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-black/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            <ArrowLeft size={15} />
            Back to KYC list
          </Link>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm text-slate-300">
              Loading KYC details...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
              Failed to load KYC details.
            </div>
          ) : null}

          {record ? (
            <>
              <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-100">{record.user.fullName}</h1>
                    <p className="mt-1 text-sm text-slate-300">{record.user.email}</p>
                  </div>
                  <span className="rounded-full border border-amber-700/60 bg-amber-900/30 px-2.5 py-1 text-xs text-amber-200">
                    {record.verificationStatus}
                  </span>
                </div>
              </article>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-100">Document Details</h2>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="text-slate-400">Type:</span> {record.documentType}
                    </p>
                    <p>
                      <span className="text-slate-400">Number:</span> {record.documentNumber}
                    </p>
                    <p>
                      <span className="text-slate-400">File Name:</span> {record.originalFileName}
                    </p>
                    <p>
                      <span className="text-slate-400">Submitted:</span>{" "}
                      {record.submittedAt ? dateFormat.format(new Date(record.submittedAt)) : "-"}
                    </p>
                    <a
                      href={record.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-emerald-800/70"
                    >
                      Open Document
                    </a>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-100">Personal Information</h2>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="text-slate-400">Full Name:</span> {record.data?.fullName ?? "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">Phone:</span> {record.data?.phoneNumber ?? "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">DOB:</span> {record.data?.dateOfBirth ?? "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">Nationality:</span> {record.data?.nationality ?? "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">Address:</span> {record.data?.address ?? "-"}
                    </p>
                  </div>
                </article>
              </div>

              <article className="rounded-2xl border border-slate-800 bg-black/80 p-5 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-100">Verification Actions</h3>
                <p className="mt-1 text-sm text-slate-300">Approve or reject this KYC request after review.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingAction("approve")}
                    className="rounded-lg border border-emerald-700/60 bg-emerald-900/40 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-800/70"
                  >
                    Approve KYC
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction("reject")}
                    className="rounded-lg border border-rose-700/60 bg-rose-900/40 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-800/70"
                  >
                    Reject KYC
                  </button>
                </div>
              </article>
            </>
          ) : null}
      </AdminDashboardShell>

      <ConfirmModal
        isOpen={pendingAction !== null}
        title={pendingAction === "approve" ? "Approve KYC?" : "Reject KYC?"}
        description={
          pendingAction === "approve"
            ? "This KYC request will be marked as verified."
            : "Please provide a rejection reason before continuing."
        }
        confirmText={pendingAction === "approve" ? "Approve" : "Reject"}
        confirmVariant={pendingAction === "approve" ? "approve" : "reject"}
        showReasonInput={pendingAction === "reject"}
        reasonValue={rejectionReason}
        onReasonChange={setRejectionReason}
        reasonPlaceholder="Enter rejection reason"
        isLoading={isVerifying}
        onCancel={() => {
          if (isVerifying) {
            return;
          }
          setPendingAction(null);
          setRejectionReason("");
        }}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
