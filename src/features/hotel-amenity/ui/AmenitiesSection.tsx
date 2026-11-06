"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useCreateHotelAmenity } from "../hooks/useCreateHotelAmenity";
import { useHotelAmenities } from "../hooks/useHotelAmenities";
import type { HotelAmenity } from "../types/hotel-amenity";
import { AmenityFormDialog } from "./AmenityFormDialog";
import { DeleteAmenityDialog } from "./DeleteAmenityDialog";

/** One-click suggestions; any already on the hotel are hidden. Edit freely. */
const SUGGESTIONS = [
  "Free Wi-Fi",
  "Breakfast included",
  "Free parking",
  "Airport transfer",
  "Restaurant",
  "Room service",
  "Hot stone bath",
  "Spa",
  "Laundry service",
  "Fitness centre",
  "24-hour front desk",
  "Heating",
];

export function AmenitiesSection({ hotelId }: { hotelId: string }) {
  const { hotelAmenities, isLoading, error, refetch } = useHotelAmenities(hotelId);
  const quickAdd = useCreateHotelAmenity();
  const [adding, setAdding] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HotelAmenity | null>(null);
  const [deleting, setDeleting] = useState<HotelAmenity | null>(null);

  const names = hotelAmenities.map((a) => a.name);
  const taken = new Set(names.map((n) => n.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !taken.has(s.toLowerCase()));

  function addSuggestion(name: string) {
    setAdding(name);
    quickAdd.createHotelAmenity(
      { hotelId, name },
      { onSettled: () => setAdding(null) },
    );
  }

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: HotelAmenity) => {
    setEditing(a);
    setFormOpen(true);
  };

  return (
    <section
      aria-labelledby="amenities-heading"
      className="mb-6 rounded-2xl border border-line bg-white"
    >
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="amenities-heading" className="text-lg font-bold text-ink">
            Amenities
            {hotelAmenities.length > 0 && (
              <span className="ml-2 text-sm font-semibold text-ink-soft">
                {hotelAmenities.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-ink-soft">What guests get when they stay here.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line transition-colors hover:ring-ink/40 sm:self-auto"
        >
          <Plus size={16} /> Add amenity
        </button>
      </div>

      <div className="space-y-5 p-5">
        {isLoading ? (
          <div className="flex flex-wrap gap-2" aria-label="Loading amenities">
            {[28, 36, 24, 32, 20].map((w, i) => (
              <span
                key={i}
                className="h-9 animate-pulse rounded-full bg-mist"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">Couldn&apos;t load amenities: {error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : hotelAmenities.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-paper px-4 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lagoon-tint text-lagoon-deep">
              <Sparkles size={18} />
            </span>
            <p className="text-sm text-ink-soft">
              No amenities yet. Pick from the suggestions below, or add your own.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {hotelAmenities.map((a) => (
              <li
                key={a.id}
                className="group flex items-start gap-3 rounded-xl border border-line px-3.5 py-3"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lagoon-tint text-lagoon-deep">
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{a.name}</p>
                  {a.description && (
                    <p className="line-clamp-2 text-xs text-ink-soft">{a.description}</p>
                  )}
                </div>
                {/* Always visible on touch; fade in on hover with a mouse */}
                <div className="-my-1 -mr-1.5 flex shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    aria-label={`Edit ${a.name}`}
                    className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(a)}
                    aria-label={`Remove ${a.name}`}
                    className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && suggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Quick add
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={adding !== null}
                  onClick={() => addSuggestion(s)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 text-sm font-medium text-ink-soft transition-colors hover:border-lagoon-deep hover:bg-lagoon-tint hover:text-lagoon-deep disabled:cursor-default disabled:opacity-60 disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-ink-soft"
                >
                  {adding === s ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Plus size={13} />
                  )}
                  {s}
                </button>
              ))}
            </div>
            {quickAdd.error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {quickAdd.error.message}
              </p>
            )}
          </div>
        )}
      </div>

      <AmenityFormDialog
        open={formOpen}
        hotelId={hotelId}
        amenity={editing}
        existingNames={names}
        onClose={() => setFormOpen(false)}
      />
      <DeleteAmenityDialog amenity={deleting} onClose={() => setDeleting(null)} />
    </section>
  );
}
