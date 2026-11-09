"use client";

import { Loader2 } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  isPending: boolean;
  error: Error | null;
  onConfirm: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

/** Generic "Delete X?" confirmation used by drivers and vehicles. */
export function ConfirmDeleteDialog({
  open,
  title,
  confirmLabel,
  isPending,
  error,
  onConfirm,
  onClose,
  children,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      size="sm"
      title={title}
    >
      <div className="space-y-4 px-6 py-5 text-sm text-ink-soft">
        {children}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-red-700"
          >
            {error.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          autoFocus
          disabled={isPending}
          onClick={onConfirm}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isPending ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
