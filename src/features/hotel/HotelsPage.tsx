"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Hotel as HotelIcon,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Loader2,
  Search,
  BedDouble,
  Trash2,
} from "lucide-react";
import { useHotels } from "./hooks/useHotels";
import { Hotel } from "./types/hotel";
import { DeleteHotelDialog } from "./ui/DeleteHotelDialog";
import { HotelFormDialog } from "./ui/HotelFormDialog";
import { Pagination } from "./ui/Pagination";
import { StarRatingDisplay, StatusBadge } from "./ui/StatusBadge";

type Filter = "all" | "active" | "inactive";

function Contact({ hotel }: { hotel: Hotel }) {
  const rows = [
    hotel.contactNumber && {
      icon: Phone,
      text: hotel.contactNumber,
      href: `tel:${hotel.contactNumber}`,
    },
    hotel.email && {
      icon: Mail,
      text: hotel.email,
      href: `mailto:${hotel.email}`,
    },
    hotel.website && {
      icon: Globe,
      text: hotel.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      href: hotel.website,
    },
  ].filter(Boolean) as { icon: typeof Phone; text: string; href: string }[];

  if (!rows.length) return <span className="text-sm text-ink-soft">—</span>;

  return (
    <ul className="space-y-1">
      {rows.map((r) => (
        <li key={r.href} className="min-w-0">
          <a
            href={r.href}
            target={r.icon === Globe ? "_blank" : undefined}
            rel={r.icon === Globe ? "noreferrer" : undefined}
            className="flex min-w-0 items-center gap-1.5 text-sm text-ink-soft hover:text-lagoon-deep"
          >
            <r.icon size={13} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{r.text}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function RowActions({
  hotel,
  onEdit,
  onDelete,
}: {
  hotel: Hotel;
  onEdit: (h: Hotel) => void;
  onDelete: (h: Hotel) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/dashboard/hotels/${hotel.id}`}
        aria-label={`Rooms at ${hotel.name}`}
        title="Rooms"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink"
      >
        <BedDouble size={15} />
      </Link>
      <button
        type="button"
        onClick={() => onEdit(hotel)}
        aria-label={`Edit ${hotel.name}`}
        title="Edit"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(hotel)}
        aria-label={`Delete ${hotel.name}`}
        title="Delete"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-line" aria-label="Loading hotels">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-10 animate-pulse rounded-lg bg-mist" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-mist" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-mist" />
          </div>
          <div className="hidden h-5 w-16 animate-pulse rounded-full bg-mist sm:block" />
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 20;

/** Waits until the user stops typing before the value changes. */
function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function HotelsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const search = useDebounced(query.trim());

  useEffect(() => setPage(1), [search, filter]);

  const {
    hotels,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useHotels({
    search: search || undefined,
    status: filter === "all" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  });

  // Deleting the last hotel on the last page would leave you on an empty page.
  useEffect(() => {
    if (
      pagination &&
      pagination.totalPages > 0 &&
      page > pagination.totalPages
    ) {
      setPage(pagination.totalPages);
    }
  }, [pagination, page]);

  // formOpen + editing: editing === null means "Add", a hotel means "Edit".
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [deleting, setDeleting] = useState<Hotel | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (h: Hotel) => {
    setEditing(h);
    setFormOpen(true);
  };

  const isFiltered = !!search || filter !== "all";
  // A background fetch for a new page / search / filter (previous results stay on screen).
  const updating = isFetching && isPlaceholderData;

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Hotels</h1>
          <p className="mt-1 text-sm text-ink-soft">
            The properties your agency books, ready to drop into packages and
            itineraries.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep sm:self-auto"
        >
          <Plus size={16} /> Add hotel
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30 sm:w-72">
            {updating ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Search size={14} aria-hidden="true" />
            )}
            <span className="sr-only">Search hotels</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or country"
              className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>

          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex gap-1 self-start rounded-full bg-mist p-1 sm:self-auto"
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
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-ink">Couldn&apos;t load hotels</p>
            <p className="mt-1 text-sm text-ink-soft">{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-inset ring-line hover:ring-ink/40"
            >
              Try again
            </button>
          </div>
        ) : hotels.length === 0 && !isFiltered ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-lagoon-tint text-lagoon-deep">
              <HotelIcon size={22} />
            </span>
            <p className="mt-4 font-semibold text-ink">No hotels yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              Add the hotels you work with so your team can pick them when
              building trips.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
            >
              <Plus size={16} /> Add your first hotel
            </button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-ink">No matching hotels</p>
            <p className="mt-1 text-sm text-ink-soft">
              Try a different search or status filter.
            </p>
          </div>
        ) : (
          // Previous results stay visible (dimmed) while the next page / search loads.
          <div
            aria-busy={updating}
            className={`transition-opacity ${updating ? "pointer-events-none opacity-60" : ""}`}
          >
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Hotel</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Rating</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hotels.map((h) => (
                  <tr
                    key={h.id}
                    className="align-top transition-colors hover:bg-paper"
                  >
                    <td className="max-w-xs px-5 py-4">
                      <div className="flex gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-sm font-bold text-lagoon-deep">
                          {h.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/hotels/${h.id}`}
                            className="block truncate font-semibold text-ink hover:text-lagoon-deep"
                          >
                            {h.name}
                          </Link>
                          {h.description && (
                            <p className="line-clamp-2 text-sm text-ink-soft">
                              {h.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-ink">
                        {h.city}, {h.country}
                      </p>
                      <p className="text-sm text-ink-soft">{h.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StarRatingDisplay value={h.starRating} />
                    </td>
                    <td className="max-w-[14rem] px-5 py-4">
                      <Contact hotel={h} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        hotel={h}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {hotels.map((h) => (
                <li key={h.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/hotels/${h.id}`}
                        className="font-semibold text-ink hover:text-lagoon-deep"
                      >
                        {h.name}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
                        <MapPin size={13} aria-hidden="true" /> {h.city},{" "}
                        {h.country}
                      </p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                  <StarRatingDisplay value={h.starRating} />
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Contact hotel={h} />
                    </div>
                    <RowActions
                      hotel={h}
                      onEdit={openEdit}
                      onDelete={setDeleting}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && hotels.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <HotelFormDialog
        open={formOpen}
        hotel={editing}
        onClose={() => setFormOpen(false)}
      />
      <DeleteHotelDialog hotel={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
