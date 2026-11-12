"use client";

import { useEffect, useState } from "react";
import { Compass, Mail, Phone, Plus } from "lucide-react";
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
import { useDeleteGuide } from "./hooks/useDeleteGuide";
import { useGuides } from "./hooks/useGuides";
import { Guide } from "./types/guide";
import { GuideFormDialog } from "./ui/GuideFormDialog";

const PAGE_SIZE = 20;

/** "Nu. 3,500" / "$45.50"; falls back to "3500 XYZ" for unknown codes. */
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

/** Price per day, with the cost underneath; a quiet "No rate" when neither is set. */
function RateCell({ guide }: { guide: Guide }) {
  const currency = guide.rateCurrency ?? "BTN";
  if (!guide.dailyPrice && !guide.dailyCost) {
    return <span className="text-sm text-ink-soft">No rate</span>;
  }
  return (
    <div className="whitespace-nowrap text-sm">
      {guide.dailyPrice ? (
        <p>
          <span className="font-semibold tabular-nums text-ink">
            {formatMoney(guide.dailyPrice, currency)}
          </span>
          <span className="text-ink-soft"> / day</span>
        </p>
      ) : (
        <p className="text-ink-soft">No price</p>
      )}
      {guide.dailyCost && (
        <p className="text-xs tabular-nums text-ink-soft">
          cost {formatMoney(guide.dailyCost, currency)}
        </p>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lagoon-tint text-sm font-bold text-lagoon-deep">
      {initials || "?"}
    </span>
  );
}

export function GuidesPage() {
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
    guides,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useGuides(params);
  const remove = useDeleteGuide();
  useClampPage(pagination?.totalPages, page, setPage);
  // A background fetch for a new page / search / filter (previous results stay on screen).
  const updating = isFetching && isPlaceholderData;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [deleting, setDeleting] = useState<Guide | null>(null);

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (g: Guide) => {
    setEditing(g);
    setFormOpen(true);
  };

  return (
    <>
      <ListHeader
        title="Guides"
        description="The licensed guides who lead your tours."
        addLabel="Add guide"
        onAdd={openAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search name, phone or CID"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        />

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load guides"
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
        ) : guides.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<Compass size={22} />}
            title="No guides yet"
            body="Add the guides you work with so you can assign them to tours."
            action={
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add your first guide
              </button>
            }
          />
        ) : guides.length === 0 ? (
          <ListMessage
            title="No matching guides"
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
                  <th className="px-5 py-3 font-semibold">Guide</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">CID</th>
                  <th className="px-5 py-3 font-semibold">Rate</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {guides.map((g) => (
                  <tr
                    key={g.id}
                    className="align-middle transition-colors hover:bg-paper"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={g.name} />
                        <p className="font-semibold text-ink">{g.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${g.phone}`}
                        className="flex items-center gap-1.5 text-sm text-ink hover:text-lagoon-deep"
                      >
                        <Phone
                          size={13}
                          className="text-ink-soft"
                          aria-hidden="true"
                        />{" "}
                        {g.phone}
                      </a>
                    </td>
                    <td className="max-w-[16rem] px-5 py-4">
                      {g.email ? (
                        <a
                          href={`mailto:${g.email}`}
                          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-lagoon-deep"
                        >
                          <Mail
                            size={13}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">{g.email}</span>
                        </a>
                      ) : (
                        <span className="text-sm text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-ink">
                      {g.cid}
                    </td>
                    <td className="px-5 py-4">
                      <RateCell guide={g} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        label={g.name}
                        onEdit={() => openEdit(g)}
                        onDelete={() => setDeleting(g)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {guides.map((g) => (
                <li key={g.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={g.name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {g.name}
                        </p>
                        <a
                          href={`tel:${g.phone}`}
                          className="text-sm text-ink-soft"
                        >
                          {g.phone}
                        </a>
                      </div>
                    </div>
                    <StatusBadge status={g.status} />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 space-y-0.5 text-sm text-ink-soft">
                      <p className="font-mono text-xs">CID {g.cid}</p>
                      {g.email && <p className="truncate">{g.email}</p>}
                      <RateCell guide={g} />
                    </div>
                    <RowActions
                      label={g.name}
                      onEdit={() => openEdit(g)}
                      onDelete={() => setDeleting(g)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && guides.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <GuideFormDialog
        open={formOpen}
        guide={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete guide?"
        confirmLabel="Delete guide"
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
          To keep their history, set them to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
