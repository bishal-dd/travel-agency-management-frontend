"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDeleteHotel } from "../hooks/useDeleteHotel";
import type { Hotel } from "../types/hotel";
import { Modal } from "./Modal";

type Props = {
  /** The hotel to delete; null keeps the dialog closed. */
  hotel: Hotel | null;
  onClose: () => void;
};

export function DeleteHotelDialog({ hotel, onClose }: Props) {
  const { deleteHotel, isPending, error, reset } = useDeleteHotel();

  // Clear any error from a previous attempt each time it opens.
  useEffect(() => {
    if (hotel) reset();
  }, [hotel, reset]);

  return (
    <Modal
      open={!!hotel}
      onClose={onClose}
      locked={isPending}
      size="sm"
      title="Delete hotel?"
    >
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{hotel?.name}</span>
          {hotel && ` in ${hotel.city}, ${hotel.country}`} will be removed from
          your agency. This can&apos;t be undone.
        </p>
        <p className="text-sm text-ink-soft">
          If you just want to stop using it for new trips, set it to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
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
          disabled={isPending || !hotel}
          onClick={() => hotel && deleteHotel(hotel.id, { onSuccess: onClose })}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isPending ? "Deleting..." : "Delete hotel"}
        </button>
      </div>
    </Modal>
  );
}
