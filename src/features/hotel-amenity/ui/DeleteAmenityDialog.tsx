"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDeleteHotelAmenity } from "../hooks/useDeleteHotelAmenity";
import type { HotelAmenity } from "../types/hotel-amenity";
import { Modal } from "../../hotel/ui/Modal";

export function DeleteAmenityDialog({
  amenity,
  onClose,
}: {
  /** The amenity to delete; null keeps the dialog closed. */
  amenity: HotelAmenity | null;
  onClose: () => void;
}) {
  const { deleteHotelAmenity, isPending, error, reset } =
    useDeleteHotelAmenity();

  useEffect(() => {
    if (amenity) reset();
  }, [amenity, reset]);

  return (
    <Modal
      open={!!amenity}
      onClose={onClose}
      locked={isPending}
      size="sm"
      title="Remove amenity?"
    >
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{amenity?.name}</span> will
          be removed from this hotel.
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
          disabled={isPending || !amenity}
          onClick={() =>
            amenity &&
            deleteHotelAmenity(
              { amenityId: amenity.id, hotelId: amenity.hotelId },
              { onSuccess: onClose },
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isPending ? "Removing..." : "Remove"}
        </button>
      </div>
    </Modal>
  );
}
