"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  confirmVariant?: "approve" | "reject";
  isLoading?: boolean;
  reasonValue?: string;
  reasonPlaceholder?: string;
  showReasonInput?: boolean;
  onReasonChange?: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  confirmVariant = "approve",
  isLoading = false,
  reasonValue = "",
  reasonPlaceholder = "Enter reason",
  showReasonInput = false,
  onReasonChange,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const confirmClass =
    confirmVariant === "reject"
      ? "border-rose-700/60 bg-rose-900/40 text-rose-100 hover:bg-rose-800/70"
      : "border-emerald-700/60 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/70";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-black p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        {showReasonInput ? (
          <textarea
            value={reasonValue}
            onChange={(event) => onReasonChange?.(event.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
          />
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
