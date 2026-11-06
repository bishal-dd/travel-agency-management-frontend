"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDeleteRoom } from "../hooks/useDeleteRoom";
import type { Room } from "../types/room";
import { Modal } from "../../hotel/ui/Modal";

type Props = {
  /** The room to delete; null keeps the dialog closed. */
  room: Room | null;
  onClose: () => void;
};

export function DeleteRoomDialog({ room, onClose }: Props) {
  const { deleteRoom, isPending, error, reset } = useDeleteRoom();

  useEffect(() => {
    if (room) reset();
  }, [room, reset]);

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      locked={isPending}
      size="sm"
      title="Delete room?"
    >
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{room?.name}</span> will be
          removed from this hotel. This can&apos;t be undone.
        </p>
        <p className="text-sm text-ink-soft">
          To stop offering it without losing it, set it to{" "}
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
          disabled={isPending || !room}
          onClick={() =>
            room &&
            deleteRoom(
              { roomId: room.id, hotelId: room.hotelId },
              { onSuccess: onClose },
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {isPending ? "Deleting..." : "Delete room"}
        </button>
      </div>
    </Modal>
  );
}
