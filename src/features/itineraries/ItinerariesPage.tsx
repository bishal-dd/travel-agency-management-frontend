"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Route,
  Trash2,
} from "lucide-react";
import { Pagination } from "../hotel/ui/Pagination";
import { StatusBadge } from "../hotel/ui/StatusBadge";
import { ConfirmDeleteDialog } from "../shared/components/ConfirmDeleteDialog";
import {
  ListHeader,
  ListToolbar,
  SkeletonRows,
  ListMessage,
} from "../shared/components/ListPage";
import { useListParams, useClampPage } from "../shared/hooks/useListParams";
import { formatLength } from "./constants/itinerary";
import { useDeleteItinerary } from "./hooks/useDeleteItinerary";
import { useDuplicateItinerary } from "./hooks/useDuplicateItinerary";
import { useItineraries } from "./hooks/useItineraries";
import { ItineraryListItem } from "./types/itinerary";
import { CreateItineraryDialog } from "./ui/CreateItineraryDialog";

const PAGE_SIZE = 20;

function Destinations({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-sm text-ink-soft">—</span>;
  return (
    <span className="flex items-center gap-1.5 text-sm text-ink">
      <MapPin size={13} className="shrink-0 text-ink-soft" aria-hidden="true" />
      <span className="truncate">{items.join(" · ")}</span>
    </span>
  );
}

function Actions({
  itinerary,
  duplicatingId,
  onDuplicate,
  onDelete,
}: {
  itinerary: ItineraryListItem;
  duplicatingId: string | null;
  onDuplicate: (i: ItineraryListItem) => void;
  onDelete: (i: ItineraryListItem) => void;
}) {
  const busy = duplicatingId === itinerary.id;
  const btn =
    "grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-50";
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/dashboard/itineraries/${itinerary.id}`}
        aria-label={`Edit ${itinerary.name}`}
        title="Edit"
        className={btn}
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        onClick={() => onDuplicate(itinerary)}
        disabled={duplicatingId !== null}
        aria-label={`Duplicate ${itinerary.name}`}
        title="Duplicate"
        className={btn}
      >
        {busy ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Copy size={15} />
        )}
      </button>
      <button
        type="button"
        onClick={() => onDelete(itinerary)}
        aria-label={`Delete ${itinerary.name}`}
        title="Delete"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function ItinerariesPage() {
  const router = useRouter();
  const {
    query,
    setQuery,
    filter,
    setFilter,
    page,
    setPage,
    params,
    isFiltered,
  } = useListParams(PAGE_SIZE);
  const {
    itineraries,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useItineraries(params);
  const remove = useDeleteItinerary();
  const duplicate = useDuplicateItinerary();
  useClampPage(pagination?.totalPages, page, setPage);
  const updating = isFetching && isPlaceholderData;

  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<ItineraryListItem | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  function onDuplicate(i: ItineraryListItem) {
    setDuplicatingId(i.id);
    duplicate.mutate(i.id, {
      // Open the copy straight away so the agent can rename and adjust it.
      onSuccess: (res) => router.push(`/dashboard/itineraries/${res.data.id}`),
      onSettled: () => setDuplicatingId(null),
    });
  }

  return (
    <>
      <ListHeader
        title="Itineraries"
        description="Reusable day-by-day trips your agents can start a booking from."
        addLabel="New itinerary"
        onAdd={() => setCreateOpen(true)}
      />

      {duplicate.error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Couldn&apos;t duplicate: {duplicate.error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search name, category or destination"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        />

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load itineraries"
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
        ) : itineraries.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<Route size={22} />}
            title="No itineraries yet"
            body="Write your standard trips once, day by day, and reuse them for every booking."
            action={
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Create your first itinerary
              </button>
            }
          />
        ) : itineraries.length === 0 ? (
          <ListMessage
            title="No matching itineraries"
            body="Try a different search or status filter."
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
                  <th className="px-5 py-3 font-semibold">Itinerary</th>
                  <th className="px-5 py-3 font-semibold">Length</th>
                  <th className="px-5 py-3 font-semibold">Destinations</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {itineraries.map((i) => (
                  <tr
                    key={i.id}
                    className="align-middle transition-colors hover:bg-paper"
                  >
                    <td className="max-w-xs px-5 py-4">
                      <Link
                        href={`/dashboard/itineraries/${i.id}`}
                        className="block truncate font-semibold text-ink hover:text-lagoon-deep"
                      >
                        {i.name}
                      </Link>
                      {i.category && (
                        <p className="text-sm text-ink-soft">{i.category}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-ink">
                      {formatLength(i.dayCount)}
                    </td>
                    <td className="max-w-[18rem] px-5 py-4">
                      <Destinations items={i.destinations} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-3 py-3">
                      <Actions
                        itinerary={i}
                        duplicatingId={duplicatingId}
                        onDuplicate={onDuplicate}
                        onDelete={setDeleting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {itineraries.map((i) => (
                <li key={i.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/itineraries/${i.id}`}
                        className="font-semibold text-ink hover:text-lagoon-deep"
                      >
                        {i.name}
                      </Link>
                      <p className="text-sm text-ink-soft">
                        {[i.category, formatLength(i.dayCount)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <StatusBadge status={i.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Destinations items={i.destinations} />
                    </div>
                    <Actions
                      itinerary={i}
                      duplicatingId={duplicatingId}
                      onDuplicate={onDuplicate}
                      onDelete={setDeleting}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && itineraries.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <CreateItineraryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete itinerary?"
        confirmLabel="Delete itinerary"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      >
        <p>
          <span className="font-semibold text-ink">{deleting?.name}</span> and
          all {deleting?.dayCount ?? 0} of its days will be deleted. This
          can&apos;t be undone.
        </p>
        <p>
          To stop using it without losing it, set it to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
