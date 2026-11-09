"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateHotelAmenity } from "../hooks/useCreateHotelAmenity";
import { useUpdateHotelAmenity } from "../hooks/useUpdateHotelAmenity";
import type { HotelAmenity } from "../types/hotel-amenity";
import { Modal } from "../../hotel/ui/Modal";

const inputCls =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/70 focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20 aria-[invalid=true]:border-red-500";

type Props = {
  open: boolean;
  onClose: () => void;
  hotelId: string;
  /** Pass an amenity to edit it; leave null to add a new one. */
  amenity?: HotelAmenity | null;
  /** Names already on this hotel, to block duplicates. */
  existingNames: string[];
};

export function AmenityFormDialog({
  open,
  onClose,
  hotelId,
  amenity,
  existingNames,
}: Props) {
  const isEdit = !!amenity;
  const create = useCreateHotelAmenity();
  const update = useUpdateHotelAmenity();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setName(amenity?.name ?? "");
    setDescription(amenity?.description ?? "");
    setNameError(undefined);
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, amenity]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setNameError("Amenity name is required.");

    const taken = existingNames.some(
      (n) =>
        n.toLowerCase() === trimmed.toLowerCase() &&
        n.toLowerCase() !== amenity?.name.toLowerCase(),
    );
    if (taken) return setNameError("This hotel already has that amenity.");

    if (amenity) {
      update.updateHotelAmenity(
        {
          amenityId: amenity.id,
          hotelId,
          // null clears a description that was removed
          data: { name: trimmed, description: description.trim() || null },
        },
        { onSuccess: onClose },
      );
    } else {
      create.createHotelAmenity(
        {
          hotelId,
          name: trimmed,
          description: description.trim() || undefined,
        },
        { onSuccess: onClose },
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      size="sm"
      title={isEdit ? "Edit amenity" : "Add amenity"}
      description={
        isEdit ? undefined : "Something this hotel offers its guests."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Name<span className="text-red-600"> *</span>
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              aria-invalid={!!nameError}
              placeholder="e.g. Hot stone bath"
              className={inputCls}
            />
            {nameError && (
              <span className="mt-1 block text-xs text-red-600">
                {nameError}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Hours, extra cost, anything guests should know"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error.message}
          </p>
        )}

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
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add amenity"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
