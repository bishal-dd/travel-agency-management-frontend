"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Car, IdCard, Mail, Phone, Plus } from "lucide-react";
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
import { useVehicles } from "../vehicle/hooks/useVehicles";
import { Vehicle } from "../vehicle/types/vehicle";
import { useDeleteDriver } from "./hooks/useDeleteDriver";
import { useDrivers } from "./hooks/useDrivers";
import { Driver } from "./types/driver";
import { DriverFormDialog } from "./ui/DriverFormDialog";
import { useListParams, useClampPage } from "../shared/hooks/useListParams";

const PAGE_SIZE = 20;
/**
 * Vehicles are loaded in one request to show "who drives what".
 * Keep this at or below your backend's maximum `limit`.
 */
const LOOKUP_LIMIT = 100;

/** "Nu. 1,500" / "$45.50"; falls back to "1500 XYZ" for unknown codes. */
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

/** What the agency pays the driver per day, or a quiet "Not set". */
function DailyCost({ driver }: { driver: Driver }) {
  if (!driver.dailyCost)
    return <span className="text-sm text-ink-soft">Not set</span>;
  return (
    <span className="whitespace-nowrap text-sm">
      <span className="font-semibold tabular-nums text-ink">
        {formatMoney(driver.dailyCost, driver.rateCurrency ?? "BTN")}
      </span>
      <span className="text-ink-soft"> / day</span>
    </span>
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
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold text-sm font-bold text-ink">
      {initials || "?"}
    </span>
  );
}

function AssignedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles.length)
    return <span className="text-sm text-ink-soft">Unassigned</span>;
  return (
    <ul className="space-y-1">
      {vehicles.map((v) => (
        <li key={v.id} className="flex items-center gap-1.5 text-sm text-ink">
          <Car
            size={13}
            className="shrink-0 text-ink-soft"
            aria-hidden="true"
          />
          <span className="truncate">{v.name}</span>
          <span className="shrink-0 font-mono text-xs text-ink-soft">
            {v.registrationNumber}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DriversPage() {
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
    drivers,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useDrivers(params);
  const { vehicles } = useVehicles({ limit: LOOKUP_LIMIT });
  const remove = useDeleteDriver();
  const queryClient = useQueryClient();
  useClampPage(pagination?.totalPages, page, setPage);
  const updating = isFetching && isPlaceholderData;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState<Driver | null>(null);

  // driverId → the vehicles they're assigned to
  const vehiclesByDriver = useMemo(() => {
    const map = new Map<string, Vehicle[]>();
    for (const v of vehicles) {
      if (!v.driverId) continue;
      map.set(v.driverId, [...(map.get(v.driverId) ?? []), v]);
    }
    return map;
  }, [vehicles]);

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (d: Driver) => {
    setEditing(d);
    setFormOpen(true);
  };

  const deletingVehicles = deleting
    ? (vehiclesByDriver.get(deleting.id) ?? [])
    : [];

  return (
    <>
      <ListHeader
        title="Drivers"
        description="Your drivers, their licences and the vehicles they're assigned to."
        addLabel="Add driver"
        onAdd={openAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search name, phone, CID or licence"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        />

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load drivers"
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
        ) : drivers.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<IdCard size={22} />}
            title="No drivers yet"
            body="Add your drivers so you can assign them to vehicles and trips."
            action={
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add your first driver
              </button>
            }
          />
        ) : drivers.length === 0 ? (
          <ListMessage
            title="No matching drivers"
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
                  <th className="px-5 py-3 font-semibold">Driver</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">CID / Licence</th>
                  <th className="px-5 py-3 font-semibold">Vehicle</th>
                  <th className="px-5 py-3 font-semibold">Daily cost</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {drivers.map((d) => (
                  <tr
                    key={d.id}
                    className="align-top transition-colors hover:bg-paper"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={d.name} />
                        <p className="font-semibold text-ink">{d.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${d.phone}`}
                        className="flex items-center gap-1.5 text-sm text-ink hover:text-lagoon-deep"
                      >
                        <Phone
                          size={13}
                          className="text-ink-soft"
                          aria-hidden="true"
                        />{" "}
                        {d.phone}
                      </a>
                      {d.email && (
                        <a
                          href={`mailto:${d.email}`}
                          className="mt-1 flex max-w-[14rem] items-center gap-1.5 text-sm text-ink-soft hover:text-lagoon-deep"
                        >
                          <Mail
                            size={13}
                            aria-hidden="true"
                            className="shrink-0"
                          />
                          <span className="truncate">{d.email}</span>
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">
                      <p className="text-ink">{d.cid}</p>
                      <p className="text-ink-soft">{d.licenseNumber}</p>
                    </td>
                    <td className="max-w-[16rem] px-5 py-4">
                      <AssignedVehicles
                        vehicles={vehiclesByDriver.get(d.id) ?? []}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <DailyCost driver={d} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        label={d.name}
                        onEdit={() => openEdit(d)}
                        onDelete={() => setDeleting(d)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {drivers.map((d) => (
                <li key={d.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={d.name} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {d.name}
                        </p>
                        <a
                          href={`tel:${d.phone}`}
                          className="text-sm text-ink-soft"
                        >
                          {d.phone}
                        </a>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="font-mono text-xs text-ink-soft">
                    CID {d.cid} · Licence {d.licenseNumber}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Daily cost:{" "}
                    {d.dailyCost ? (
                      <span className="font-semibold tabular-nums text-ink">
                        {formatMoney(d.dailyCost, d.rateCurrency ?? "BTN")}
                      </span>
                    ) : (
                      "not set"
                    )}
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <AssignedVehicles
                        vehicles={vehiclesByDriver.get(d.id) ?? []}
                      />
                    </div>
                    <RowActions
                      label={d.name}
                      onEdit={() => openEdit(d)}
                      onDelete={() => setDeleting(d)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && drivers.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <DriverFormDialog
        open={formOpen}
        driver={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete driver?"
        confirmLabel="Delete driver"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              // Vehicles may still point at this driver; refresh them too.
              queryClient.invalidateQueries({ queryKey: ["vehicles"] });
              setDeleting(null);
            },
          })
        }
      >
        <p>
          <span className="font-semibold text-ink">{deleting?.name}</span> will
          be removed from your agency. This can&apos;t be undone.
        </p>
        {deletingVehicles.length > 0 && (
          <p className="rounded-lg bg-marigold/15 px-3 py-2 text-ink">
            They&apos;re assigned to{" "}
            <span className="font-semibold">
              {deletingVehicles.map((v) => v.name).join(", ")}
            </span>
            . Reassign{" "}
            {deletingVehicles.length > 1 ? "those vehicles" : "that vehicle"}{" "}
            afterwards.
          </p>
        )}
        <p>
          To keep their history, set them to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
