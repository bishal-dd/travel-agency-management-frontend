"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Ticket } from "lucide-react";
import { formatDuration, formatPrice } from "@/src/lib/format";
import { Pagination } from "../hotel/ui/Pagination";
import { StatusBadge } from "../hotel/ui/StatusBadge";
import { ConfirmDeleteDialog } from "../shared/components/ConfirmDeleteDialog";
import {
  ListHeader,
  ListToolbar,
  SkeletonRows,
  ListMessage,
  RowActions,
} from "../shared/components/ListPage";
import { useListParams, useClampPage } from "../shared/hooks/useListParams";
import { useDeleteService } from "./hooks/useDeleteService";
import { useServices } from "./hooks/useServices";
import { Service } from "./types/service";
import { ServiceFormDialog } from "./ui/ServiceFormDialog";

const PAGE_SIZE = 20;

function CategoryTag({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink-soft">
      {value}
    </span>
  );
}

function Duration({ minutes }: { minutes: number | null }) {
  const text = formatDuration(minutes);
  if (!text) return <span className="text-sm text-ink-soft">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink">
      <Clock size={13} className="text-ink-soft" aria-hidden="true" /> {text}
    </span>
  );
}

export function ServicesPage() {
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
    services,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useServices(params);
  const remove = useDeleteService();
  useClampPage(pagination?.totalPages, page, setPage);
  // A background fetch for a new page / search / filter (previous results stay on screen).
  const updating = isFetching && isPlaceholderData;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setFormOpen(true);
  };

  return (
    <>
      <ListHeader
        title="Services"
        description="Transfers, activities, permits and extras you add to packages and itineraries."
        addLabel="Add service"
        onAdd={openAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search services"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        />

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load services"
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
        ) : services.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<Ticket size={22} />}
            title="No services yet"
            body="Add the transfers, activities, permits and extras you sell, with their prices."
            action={
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add your first service
              </button>
            }
          />
        ) : services.length === 0 ? (
          <ListMessage
            title="No matching services"
            body="Try a different search or status filter."
          />
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
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((s) => (
                  <tr
                    key={s.id}
                    className={`align-top transition-colors hover:bg-paper ${
                      s.status === "inactive" ? "text-ink-soft" : ""
                    }`}
                  >
                    <td className="max-w-sm px-5 py-4">
                      <p className="font-semibold text-ink">{s.name}</p>
                      {s.description && (
                        <p className="line-clamp-2 text-sm text-ink-soft">
                          {s.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <CategoryTag value={s.category} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Duration minutes={s.durationMinutes} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-ink">
                      {formatPrice(s.price, s.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        label={s.name}
                        onEdit={() => openEdit(s)}
                        onDelete={() => setDeleting(s)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {services.map((s) => (
                <li key={s.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{s.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <CategoryTag value={s.category} />
                        <Duration minutes={s.durationMinutes} />
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-ink">
                      {formatPrice(s.price, s.currency)}
                    </p>
                  </div>
                  {s.description && (
                    <p className="line-clamp-2 text-sm text-ink-soft">
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge status={s.status} />
                    <RowActions
                      label={s.name}
                      onEdit={() => openEdit(s)}
                      onDelete={() => setDeleting(s)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && services.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <ServiceFormDialog
        open={formOpen}
        service={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete service?"
        confirmLabel="Delete service"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      >
        <p>
          <span className="font-semibold text-ink">{deleting?.name}</span> will
          be removed from your agency. This can&apos;t be undone.
        </p>
        <p>
          To stop offering it without losing it from past bookings, set it to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
