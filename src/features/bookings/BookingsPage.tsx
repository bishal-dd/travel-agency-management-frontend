"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Pagination } from "../hotel/ui/Pagination";
import {
  ListHeader,
  SkeletonRows,
  ListMessage,
} from "../shared/components/ListPage";
import { useDebounced, useClampPage } from "../shared/hooks/useListParams";
import { useBookings } from "./hooks/useBookings";
import {
  BookingStatus,
  GetBookingsParams,
  BOOKING_STATUSES,
} from "./types/booking";
import {
  todayIso,
  addDays,
  STATUS_LABEL,
  formatDateRange,
  tripLength,
  formatPax,
  BookingStatusBadge,
} from "./ui/bookingUi";
import { NewBookingDialog } from "./ui/NewBookingDialog";

const PAGE_SIZE = 20;

type StatusTab = "all" | BookingStatus;
type Departing = "any" | "7" | "30" | "upcoming";

const DEPARTING_OPTIONS: { value: Departing; label: string }[] = [
  { value: "any", label: "Any date" },
  { value: "7", label: "Next 7 days" },
  { value: "30", label: "Next 30 days" },
  { value: "upcoming", label: "All upcoming" },
];

export function BookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusTab>("all");
  const [departing, setDeparting] = useState<Departing>("any");
  // The date range is worked out when the filter is picked (an event), not during
  // render: Next.js can't prerender a page that reads "today" while rendering.
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const search = useDebounced(query.trim());

  // Any new search or filter starts again from page 1.
  useEffect(() => setPage(1), [search, status, departing]);

  function changeDeparting(value: Departing) {
    setDeparting(value);
    if (value === "any") return setRange({});
    const today = todayIso();
    setRange({
      from: today,
      to:
        value === "7"
          ? addDays(today, 7)
          : value === "30"
            ? addDays(today, 30)
            : undefined,
    });
  }

  const params = useMemo<GetBookingsParams>(
    () => ({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      departFrom: range.from,
      departTo: range.to,
      // With a date filter, the soonest departure first is what agents want.
      sort: range.from ? "departure" : "created",
      page,
      limit: PAGE_SIZE,
    }),
    [search, status, range, page],
  );

  const {
    bookings,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useBookings(params);
  useClampPage(pagination?.totalPages, page, setPage);
  const updating = isFetching && isPlaceholderData;
  const isFiltered = !!search || status !== "all" || departing !== "any";

  return (
    <>
      <ListHeader
        title="Bookings"
        description="Every trip, from first inquiry to the day they fly home."
        addLabel="New booking"
        onAdd={() => setNewOpen(true)}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {/* Toolbar */}
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30 sm:w-80">
              {updating ? (
                <Loader2
                  size={14}
                  className="shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Search size={14} className="shrink-0" aria-hidden="true" />
              )}
              <span className="sr-only">Search bookings</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reference, title or customer"
                className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
              />
            </label>

            <div className="relative self-start sm:self-auto">
              <label htmlFor="departing" className="sr-only">
                Departing
              </label>
              <select
                id="departing"
                value={departing}
                onChange={(e) => changeDeparting(e.target.value as Departing)}
                className="h-9 appearance-none rounded-full bg-mist pl-4 pr-9 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-lagoon-deep/30"
              >
                {DEPARTING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.value === "any"
                      ? "Departing: any date"
                      : `Departing: ${o.label.toLowerCase()}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
            </div>
          </div>

          {/* Status tabs scroll sideways on small screens */}
          <div
            role="tablist"
            aria-label="Filter by status"
            className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]"
          >
            {(["all", ...BOOKING_STATUSES] as StatusTab[]).map((s) => (
              <button
                key={s}
                role="tab"
                type="button"
                aria-selected={status === s}
                onClick={() => setStatus(s)}
                className={`h-8 shrink-0 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  status === s
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-mist hover:text-ink"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load bookings"
            body={error.message}
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-inset ring-line hover:ring-ink/40"
              >
                Try again
              </button>
            }
          />
        ) : bookings.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<CalendarCheck size={22} />}
            title="No bookings yet"
            body="Create a booking when an inquiry comes in, then take it from quote to confirmed."
            action={
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Create your first booking
              </button>
            }
          />
        ) : bookings.length === 0 ? (
          <ListMessage
            title="No matching bookings"
            body="Try a different search or filter."
          />
        ) : (
          <div
            aria-busy={updating}
            className={`transition-opacity ${updating ? "pointer-events-none opacity-60" : ""}`}
          >
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Booking</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Dates</th>
                  <th className="px-5 py-3 font-semibold">Guests</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="group relative align-middle transition-colors hover:bg-paper"
                  >
                    <td className="max-w-xs px-5 py-4">
                      {/* The whole row is clickable via this link's ::after */}
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="font-mono text-xs font-semibold text-ink-soft after:absolute after:inset-0"
                      >
                        {b.reference}
                      </Link>
                      <p className="truncate font-semibold text-ink group-hover:text-lagoon-deep">
                        {b.title}
                      </p>
                    </td>
                    <td className="max-w-[14rem] px-5 py-4">
                      <p className="truncate text-sm text-ink">
                        {b.customer.name}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {b.customer.type === "company"
                          ? "Company"
                          : "Individual"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm text-ink">
                        {formatDateRange(b.startDate, b.endDate)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {tripLength(b.startDate, b.endDate)} days
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <Users
                          size={13}
                          className="text-ink-soft"
                          aria-hidden="true"
                        />
                        {formatPax(b.adults, b.children)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <BookingStatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/dashboard/bookings/${b.id}`}
                    className="block space-y-1.5 p-4 hover:bg-paper"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-ink-soft">
                          {b.reference}
                        </p>
                        <p className="truncate font-semibold text-ink">
                          {b.title}
                        </p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-ink-soft">
                      {b.customer.name} ·{" "}
                      {formatDateRange(b.startDate, b.endDate)} ·{" "}
                      {formatPax(b.adults, b.children)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && bookings.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <NewBookingDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}
