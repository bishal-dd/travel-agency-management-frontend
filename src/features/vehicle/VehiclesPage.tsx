"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, Phone, Plus, Users } from "lucide-react";
import { useDrivers } from "../driver/hooks/useDrivers";
import { Driver } from "../driver/types/driver";
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
import { useDeleteVehicle } from "./hooks/useDeleteVehicle";
import { useVehicles } from "./hooks/useVehicles";
import { Vehicle } from "./types/vehicle";
import { VehicleFormDialog } from "./ui/VehicleFormDialog";

const PAGE_SIZE = 20;
/**
 * Drivers (and all vehicles, for the "already drives" warning) are loaded in
 * one request each. Keep this at or below your backend's maximum `limit`.
 */
const LOOKUP_LIMIT = 100;

function Plate({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-ink">
      {value}
    </span>
  );
}

function DriverCell({
  driver,
  hasDriverId,
}: {
  driver?: Driver;
  hasDriverId: boolean;
}) {
  if (!driver) {
    return (
      <span className="text-sm text-ink-soft">
        {hasDriverId ? "Driver removed" : "Unassigned"}
      </span>
    );
  }
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-ink">
        {driver.name}
        {driver.status === "inactive" && (
          <span className="ml-1.5 text-xs font-normal text-ink-soft">
            (inactive)
          </span>
        )}
      </p>
      <a
        href={`tel:${driver.phone}`}
        className="flex items-center gap-1 text-sm text-ink-soft hover:text-lagoon-deep"
      >
        <Phone size={12} aria-hidden="true" /> {driver.phone}
      </a>
    </div>
  );
}

export function VehiclesPage() {
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
    vehicles,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useVehicles(params);
  // Lookups: every driver (names in the table + the form's dropdown) and
  // every vehicle (to warn when a driver already has one).
  const { drivers } = useDrivers({ limit: LOOKUP_LIMIT });
  const { vehicles: allVehicles } = useVehicles({ limit: LOOKUP_LIMIT });
  const remove = useDeleteVehicle();
  useClampPage(pagination?.totalPages, page, setPage);
  const updating = isFetching && isPlaceholderData;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const driverById = useMemo(
    () => new Map(drivers.map((d) => [d.id, d])),
    [drivers],
  );

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setFormOpen(true);
  };

  return (
    <>
      <ListHeader
        title="Vehicles"
        description="The vehicles your agency uses for transfers and tours."
        addLabel="Add vehicle"
        onAdd={openAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search name, plate or type"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        />

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load vehicles"
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
        ) : vehicles.length === 0 && !isFiltered ? (
          <ListMessage
            icon={<Bus size={22} />}
            title="No vehicles yet"
            body="Add your cars, vans and buses, then assign a driver to each."
            action={
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add your first vehicle
              </button>
            }
          />
        ) : vehicles.length === 0 ? (
          <ListMessage
            title="No matching vehicles"
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
                  <th className="px-5 py-3 font-semibold">Vehicle</th>
                  <th className="px-5 py-3 font-semibold">Registration</th>
                  <th className="px-5 py-3 font-semibold">Seats</th>
                  <th className="px-5 py-3 font-semibold">Driver</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="align-middle transition-colors hover:bg-paper"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep">
                          <Bus size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {v.name}
                          </p>
                          <p className="text-sm text-ink-soft">
                            {v.vehicleType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Plate value={v.registrationNumber} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                        <Users
                          size={14}
                          className="text-ink-soft"
                          aria-hidden="true"
                        />
                        {v.seatingCapacity}
                      </span>
                    </td>
                    <td className="max-w-[14rem] px-5 py-4">
                      <DriverCell
                        driver={
                          v.driverId ? driverById.get(v.driverId) : undefined
                        }
                        hasDriverId={!!v.driverId}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        label={v.name}
                        onEdit={() => openEdit(v)}
                        onDelete={() => setDeleting(v)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {vehicles.map((v) => (
                <li key={v.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {v.name}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {v.vehicleType} · {v.seatingCapacity} seats
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <Plate value={v.registrationNumber} />
                  <div className="flex items-end justify-between gap-3">
                    <DriverCell
                      driver={
                        v.driverId ? driverById.get(v.driverId) : undefined
                      }
                      hasDriverId={!!v.driverId}
                    />
                    <RowActions
                      label={v.name}
                      onEdit={() => openEdit(v)}
                      onDelete={() => setDeleting(v)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && vehicles.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <VehicleFormDialog
        open={formOpen}
        vehicle={editing}
        drivers={drivers}
        vehicles={allVehicles}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete vehicle?"
        confirmLabel="Delete vehicle"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      >
        <p>
          <span className="font-semibold text-ink">{deleting?.name}</span>
          {deleting && (
            <>
              {" "}
              (<span className="font-mono">{deleting.registrationNumber}</span>)
            </>
          )}{" "}
          will be removed from your agency. This can&apos;t be undone.
        </p>
        <p>
          To stop using it without losing its history, set it to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
