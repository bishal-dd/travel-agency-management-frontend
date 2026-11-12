"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import {
  ChipPicker,
  Field,
  FormFooter,
  ServerError,
  StatusToggle,
  inputCls,
  type Status,
} from "../../shared/components/FormBits";

import { useCreateVehicle } from "../hooks/useCreateVehicle";
import { useUpdateVehicle } from "../hooks/useUpdateVehicle";
import type { CreateVehicleInput, Vehicle } from "../types/vehicle";
import { Driver } from "../../driver/types/driver";
import { Modal } from "../../hotel/ui/Modal";

const VEHICLE_TYPES = ["Car", "SUV", "Van", "Hiace", "Coaster", "Bus"];

type FormState = {
  name: string;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  driverId: string; // "" = unassigned
  /** Default rate per day; "" = not set. */
  dailyPrice: string;
  dailyCost: string;
  rateCurrency: string;
  status: Status;
};

/** BTN first: vehicle hire is usually paid in ngultrum. */
const RATE_CURRENCIES = ["BTN", "USD", "INR", "EUR"];

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));
/** "8500.00" → "8500", null → "" */
const moneyText = (v: string | null | undefined) =>
  v == null ? "" : String(Number(v));

const empty: FormState = {
  name: "",
  registrationNumber: "",
  vehicleType: "",
  seatingCapacity: 4,
  driverId: "",
  dailyPrice: "",
  dailyCost: "",
  rateCurrency: "BTN",
  status: "active",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Vehicle name is required.";
  if (!f.registrationNumber.trim())
    e.registrationNumber = "Registration number is required.";
  if (!f.vehicleType.trim()) e.vehicleType = "Vehicle type is required.";
  if (!Number.isInteger(f.seatingCapacity) || f.seatingCapacity < 1)
    e.seatingCapacity = "At least 1 seat.";
  if ((f.dailyPrice ?? "").trim() && !isMoney(f.dailyPrice))
    e.dailyPrice = "Enter an amount like 8500 or 45.50.";
  if ((f.dailyCost ?? "").trim() && !isMoney(f.dailyCost))
    e.dailyCost = "Enter an amount like 5000 or 45.50.";
  return e;
}

function toInput(f: FormState): CreateVehicleInput {
  const price = (f.dailyPrice ?? "").trim().replace(/,/g, "");
  const cost = (f.dailyCost ?? "").trim().replace(/,/g, "");
  return {
    name: f.name.trim(),
    registrationNumber: f.registrationNumber.trim().toUpperCase(),
    vehicleType: f.vehicleType.trim(),
    seatingCapacity: f.seatingCapacity,
    driverId: f.driverId || null, // null unassigns the driver
    // Empty = no rate (null clears an existing one on edit).
    dailyPrice: price || null,
    dailyCost: cost || null,
    rateCurrency: price || cost ? f.rateCurrency || "BTN" : null,
    status: f.status,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass a vehicle to edit; leave null to add. */
  vehicle?: Vehicle | null;
  drivers: Driver[];
  /** All vehicles, to warn when a driver already has one. */
  vehicles: Vehicle[];
};

export function VehicleFormDialog({
  open,
  onClose,
  vehicle,
  drivers,
  vehicles,
}: Props) {
  const isEdit = !!vehicle;
  const create = useCreateVehicle();
  const update = useUpdateVehicle();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      vehicle
        ? {
            name: vehicle.name,
            registrationNumber: vehicle.registrationNumber,
            vehicleType: vehicle.vehicleType,
            seatingCapacity: vehicle.seatingCapacity,
            driverId: vehicle.driverId ?? "",
            dailyPrice: moneyText(vehicle.dailyPrice),
            dailyCost: moneyText(vehicle.dailyCost),
            rateCurrency: vehicle.rateCurrency ?? "BTN",
            status: vehicle.status,
          }
        : empty,
    );
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    // Merge over `empty` so every field always exists (e.g. after a hot reload).
    setForm((f) => ({ ...empty, ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  }

  // Active drivers, plus the current one even if they've since been set inactive.
  const driverOptions = useMemo(
    () =>
      drivers
        .filter((d) => d.status === "active" || d.id === vehicle?.driverId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [drivers, vehicle],
  );

  // "Kinley already drives the Hiace (BP-1-A1234)"
  const otherVehicles = form.driverId
    ? vehicles.filter(
        (v) => v.driverId === form.driverId && v.id !== vehicle?.id,
      )
    : [];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (vehicle) {
      update.mutate(
        { vehicleId: vehicle.id, input: toInput(form) },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(toInput(form), { onSuccess: onClose });
    }
  }

  const stepBtn =
    "grid size-10 shrink-0 place-items-center text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40";

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit vehicle" : "Add vehicle"}
      description={
        isEdit
          ? `Update ${vehicle!.name}.`
          : "Add a vehicle your agency uses for transfers and tours."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Vehicle name"
            htmlFor="v-name"
            required
            error={errors.name}
          >
            <input
              id="v-name"
              autoFocus
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              aria-invalid={!!errors.name}
              placeholder="e.g. Toyota Hiace"
              className={inputCls}
            />
          </Field>

          <Field
            label="Registration number"
            htmlFor="v-reg"
            required
            error={errors.registrationNumber}
          >
            <input
              id="v-reg"
              value={form.registrationNumber}
              onChange={(e) =>
                setField("registrationNumber", e.target.value.toUpperCase())
              }
              aria-invalid={!!errors.registrationNumber}
              placeholder="BP-1-A1234"
              className={`${inputCls} font-mono uppercase tracking-wide`}
            />
          </Field>

          <Field
            label="Vehicle type"
            htmlFor="v-type"
            required
            error={errors.vehicleType}
            className="sm:col-span-2"
          >
            <ChipPicker
              label="Common vehicle types"
              options={VEHICLE_TYPES}
              value={form.vehicleType}
              onPick={(t) => setField("vehicleType", t)}
            />
            <input
              id="v-type"
              value={form.vehicleType}
              onChange={(e) => setField("vehicleType", e.target.value)}
              aria-invalid={!!errors.vehicleType}
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <Field
            label="Seats"
            htmlFor="v-seats"
            error={errors.seatingCapacity}
            hint="Passenger seats, not counting the driver."
          >
            <div
              className={`flex h-10 items-center overflow-hidden rounded-lg border bg-white ${
                errors.seatingCapacity ? "border-red-500" : "border-line"
              }`}
            >
              <button
                type="button"
                aria-label="Fewer seats"
                disabled={form.seatingCapacity <= 1}
                onClick={() =>
                  setField(
                    "seatingCapacity",
                    Math.max(1, form.seatingCapacity - 1),
                  )
                }
                className={stepBtn}
              >
                <Minus size={14} />
              </button>
              <input
                id="v-seats"
                type="number"
                inputMode="numeric"
                min={1}
                value={
                  Number.isNaN(form.seatingCapacity) ? "" : form.seatingCapacity
                }
                onChange={(e) =>
                  setField(
                    "seatingCapacity",
                    e.target.value === "" ? NaN : Number(e.target.value),
                  )
                }
                className="h-full w-full min-w-0 border-x border-line bg-transparent text-center text-sm font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="More seats"
                onClick={() =>
                  setField(
                    "seatingCapacity",
                    (Number.isNaN(form.seatingCapacity)
                      ? 0
                      : form.seatingCapacity) + 1,
                  )
                }
                className={stepBtn}
              >
                <Plus size={14} />
              </button>
            </div>
          </Field>

          <Field label="Status">
            <StatusToggle
              value={form.status}
              onChange={(s) => setField("status", s)}
            />
          </Field>

          <Field
            label="Driver"
            htmlFor="v-driver"
            className="sm:col-span-2"
            hint={
              otherVehicles.length > 0 ? (
                <span className="text-ink">
                  Already drives{" "}
                  {otherVehicles
                    .map((v) => `${v.name} (${v.registrationNumber})`)
                    .join(", ")}
                  .
                </span>
              ) : driverOptions.length === 0 ? (
                "No active drivers yet. Add drivers on the Drivers page."
              ) : undefined
            }
          >
            <div className="relative">
              <select
                id="v-driver"
                value={form.driverId}
                onChange={(e) => setField("driverId", e.target.value)}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">Unassigned</option>
                {driverOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.phone}
                    {d.status === "inactive" ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
              />
            </div>
          </Field>

          <div className="space-y-3 border-t border-line pt-5 sm:col-span-2">
            <div>
              <p className="text-sm font-semibold text-ink">Rate per day</p>
              <p className="text-xs text-ink-soft">
                The price is what the customer pays for the vehicle{" "}
                <strong>with its driver</strong>. The cost is only the vehicle
                (hire, fuel, running costs); the driver&apos;s daily cost is set
                on the driver. Optional, and agents can still set a special
                price.
              </p>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr_1fr] gap-3">
              <Field label="Currency" htmlFor="v-rate-currency">
                <div className="relative">
                  <select
                    id="v-rate-currency"
                    value={form.rateCurrency || "BTN"}
                    onChange={(e) => setField("rateCurrency", e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {[
                      ...new Set([
                        form.rateCurrency || "BTN",
                        ...RATE_CURRENCIES,
                      ]),
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                </div>
              </Field>
              <Field
                label="Price"
                htmlFor="v-rate-price"
                error={errors.dailyPrice}
                hint="Customer pays, with driver"
              >
                <input
                  id="v-rate-price"
                  inputMode="decimal"
                  value={form.dailyPrice ?? ""}
                  onChange={(e) => setField("dailyPrice", e.target.value)}
                  aria-invalid={!!errors.dailyPrice}
                  placeholder="Not set"
                  className={`${inputCls} text-right font-semibold tabular-nums`}
                />
              </Field>
              <Field
                label="Cost"
                htmlFor="v-rate-cost"
                error={errors.dailyCost}
                hint="You pay, vehicle only"
              >
                <input
                  id="v-rate-cost"
                  inputMode="decimal"
                  value={form.dailyCost ?? ""}
                  onChange={(e) => setField("dailyCost", e.target.value)}
                  aria-invalid={!!errors.dailyCost}
                  placeholder="Not set"
                  className={`${inputCls} text-right tabular-nums`}
                />
              </Field>
            </div>
          </div>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add vehicle"}
        />
      </form>
    </Modal>
  );
}
