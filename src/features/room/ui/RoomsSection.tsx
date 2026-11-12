"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  Baby,
  DoorOpen,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useRooms } from "../hooks/useRooms";
import type { Room } from "../types/room";
import { DeleteRoomDialog } from "./DeleteRoomDialog";
import { RoomFormDialog } from "./RoomFormDialog";
import { StatusBadge } from "../../hotel/ui/StatusBadge";

type Filter = "all" | "active" | "inactive";

/** "Nu. 10,200" / "$120"; falls back to "10200 XYZ" for unknown codes. */
function formatMoney(amount: string, currency: string) {
  const n = Number(amount);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString("en")} ${currency}`;
  }
}

/** Price per night, with the cost beside it; a quiet note when no rate is set. */
function RoomRate({ room }: { room: Room }) {
  const currency = room.rateCurrency ?? "BTN";
  if (!room.ratePrice && !room.rateCost) {
    return (
      <p className="mt-3 text-xs text-ink-soft">
        No rate set: priced by hand on bookings
      </p>
    );
  }
  return (
    <p className="mt-3 text-sm">
      {room.ratePrice ? (
        <>
          <span className="font-semibold tabular-nums text-ink">
            {formatMoney(room.ratePrice, currency)}
          </span>
          <span className="text-ink-soft"> / night</span>
        </>
      ) : (
        <span className="text-ink-soft">No price</span>
      )}
      {room.rateCost && (
        <span className="text-xs tabular-nums text-ink-soft">
          {" "}
          · cost {formatMoney(room.rateCost, currency)}
        </span>
      )}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-paper px-4 py-3">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function RoomCard({
  room,
  onEdit,
  onDelete,
}: {
  room: Room;
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
}) {
  return (
    <li
      className={`flex flex-col rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-sm ${
        room.status === "inactive" ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink-soft">
            {room.roomType}
          </span>
          <h3 className="mt-2 truncate font-semibold text-ink">{room.name}</h3>
        </div>
        <StatusBadge status={room.status} />
      </div>

      {room.description && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
          {room.description}
        </p>
      )}

      <RoomRate room={room} />

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-sm">
        <div>
          <dt className="flex items-center gap-1 text-xs text-ink-soft">
            <User size={12} aria-hidden="true" /> Adults
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{room.maxAdults}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-ink-soft">
            <Baby size={12} aria-hidden="true" /> Children
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{room.maxChildren}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-ink-soft">
            <DoorOpen size={12} aria-hidden="true" /> Rooms
          </dt>
          <dd className="mt-0.5 font-semibold text-ink">{room.totalRooms}</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(room)}
          aria-label={`Edit ${room.name}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-mist hover:text-ink"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(room)}
          aria-label={`Delete ${room.name}`}
          className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export function RoomsSection({ hotelId }: { hotelId: string }) {
  const { rooms, isLoading, error, refetch } = useRooms(hotelId);
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (r: Room) => {
    setEditing(r);
    setFormOpen(true);
  };

  const summary = useMemo(() => {
    const active = rooms.filter((r) => r.status === "active");
    return {
      types: rooms.length,
      inventory: active.reduce((n, r) => n + r.totalRooms, 0),
      maxGuests: rooms.reduce(
        (n, r) => Math.max(n, r.maxAdults + r.maxChildren),
        0,
      ),
      counts: {
        all: rooms.length,
        active: active.length,
        inactive: rooms.length - active.length,
      },
    };
  }, [rooms]);

  const visible =
    filter === "all" ? rooms : rooms.filter((r) => r.status === filter);

  return (
    <section
      aria-labelledby="rooms-heading"
      className="rounded-2xl border border-line bg-white"
    >
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="rooms-heading" className="text-lg font-bold text-ink">
            Rooms
          </h2>
          <p className="text-sm text-ink-soft">
            Room types and how many of each this hotel has.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep sm:self-auto"
        >
          <Plus size={16} /> Add room
        </button>
      </div>

      <div className="p-5">
        {isLoading ? (
          <ul
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading rooms"
          >
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-52 animate-pulse rounded-2xl bg-mist" />
            ))}
          </ul>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-ink">Couldn&apos;t load rooms</p>
            <p className="mt-1 text-sm text-ink-soft">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-inset ring-line hover:ring-ink/40"
            >
              Try again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-lagoon-tint text-lagoon-deep">
              <BedDouble size={22} />
            </span>
            <p className="mt-4 font-semibold text-ink">No rooms yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              Add the room types this hotel offers, like Double or Suite, so you
              can book guests into them.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
            >
              <Plus size={16} /> Add the first room
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <Stat label="Room types" value={summary.types} />
              <Stat label="Active rooms" value={summary.inventory} />
              <Stat label="Max guests / room" value={summary.maxGuests} />
            </div>

            <div
              role="tablist"
              aria-label="Filter rooms by status"
              className="mb-4 inline-flex gap-1 rounded-full bg-mist p-1"
            >
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  role="tab"
                  type="button"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold capitalize transition-colors ${
                    filter === f
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {f}
                  <span className="text-xs text-ink-soft">
                    {summary.counts[f]}
                  </span>
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-soft">
                No {filter} rooms.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <RoomFormDialog
        open={formOpen}
        hotelId={hotelId}
        room={editing}
        onClose={() => setFormOpen(false)}
      />
      <DeleteRoomDialog room={deleting} onClose={() => setDeleting(null)} />
    </section>
  );
}
