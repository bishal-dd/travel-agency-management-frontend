"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** While true, Escape / backdrop / X won't close (e.g. a save is in flight). */
  locked?: boolean;
  title: string;
  description?: React.ReactNode;
  size?: "sm" | "lg";
  children: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  locked = false,
  title,
  description,
  size = "lg",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, locked, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={() => !locked && onClose()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`animate-rise relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-deep [animation-duration:0.25s] sm:rounded-2xl ${
          size === "sm" ? "sm:max-w-md" : "sm:max-w-2xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-lg font-bold text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
