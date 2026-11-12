"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Minus, Plus } from "lucide-react";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useUpdateRoom } from "../hooks/useUpdateRoom";
import type { CreateRoomPayload, Room, UpdateRoomPayload } from "../types/room";
import { Modal } from "../../hotel/ui/Modal";

const ROOM_TYPES = [
  "Single",
  "Double",
  "Twin",
  "Triple",
  "Family",
  "Deluxe",
  "Suite",
];

type FormState = {
  name: string;
  description: string;
  roomType: string;
  maxAdults: number;
  maxChildren: number;
  totalRooms: number;
  /** Default rate per room per night; "" = not set. */
  ratePrice: string;
  rateCost: string;
  rateCurrency: string;
  status: "active" | "inactive";
};

/** BTN first: hotels usually charge agencies in ngultrum. */
const RATE_CURRENCIES = ["BTN", "USD", "INR", "EUR"];

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));
/** "10200.00" → "10200", null → "" */
const moneyText = (v: string | null | undefined) =>
  v == null ? "" : String(Number(v));

const empty: FormState = {
  name: "",
  description: "",
  roomType: "",
  maxAdults: 2,
  maxChildren: 0,
  totalRooms: 1,
  ratePrice: "",
  rateCost: "",
  rateCurrency: "BTN",
  status: "active",
};

function fromRoom(r: Room): FormState {
  return {
    name: r.name,
    description: r.description ?? "",
    roomType: r.roomType,
    maxAdults: r.maxAdults,
    maxChildren: r.maxChildren,
    totalRooms: r.totalRooms,
    ratePrice: moneyText(r.ratePrice),
    rateCost: moneyText(r.rateCost),
    rateCurrency: r.rateCurrency ?? "BTN",
    status: r.status,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Room name is required.";
  if (!f.roomType.trim()) e.roomType = "Room type is required.";
  if (!Number.isInteger(f.maxAdults) || f.maxAdults < 1)
    e.maxAdults = "At least 1 adult.";
  if (!Number.isInteger(f.maxChildren) || f.maxChildren < 0)
    e.maxChildren = "Can't be negative.";
  if (!Number.isInteger(f.totalRooms) || f.totalRooms < 1)
    e.totalRooms = "At least 1 room.";
  if (f.ratePrice.trim() && !isMoney(f.ratePrice))
    e.ratePrice = "Enter an amount like 120 or 10200.";
  if (f.rateCost.trim() && !isMoney(f.rateCost))
    e.rateCost = "Enter an amount like 90 or 7500.";
  return e;
}

const inputCls =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/70 focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20 aria-[invalid=true]:border-red-500";

function Field({
  label,
  hint,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
      )}
    </div>
  );
}

/** − [ n ] + counter; typing a number directly also works. */
function Stepper({
  value,
  onChange,
  min,
  label,
  invalid,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  label: string;
  invalid?: boolean;
}) {
  const btn =
    "grid size-10 shrink-0 place-items-center text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40";
  return (
    <div
      className={`flex h-10 items-center overflow-hidden rounded-lg border bg-white ${
        invalid ? "border-red-500" : "border-line"
      }`}
    >
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={btn}
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        aria-label={label}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
        className="h-full w-full min-w-0 border-x border-line bg-transparent text-center text-sm font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange((Number.isNaN(value) ? min : value) + 1)}
        className={btn}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  hotelId: string;
  /** Pass a room to edit it; leave null to add a new one. */
  room?: Room | null;
};

export function RoomFormDialog({ open, onClose, hotelId, room }: Props) {
  const isEdit = !!room;
  const create = useCreateRoom();
  const update = useUpdateRoom();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  // Fresh form + cleared server errors each time it opens.
  useEffect(() => {
    if (!open) return;
    setForm(room ? fromRoom(room) : empty);
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    const base = {
      name: form.name.trim(),
      roomType: form.roomType.trim(),
      maxAdults: form.maxAdults,
      maxChildren: form.maxChildren,
      totalRooms: form.totalRooms,
      // Empty = no rate (null clears an existing one on edit).
      ratePrice: form.ratePrice.trim()
        ? form.ratePrice.trim().replace(/,/g, "")
        : null,
      rateCost: form.rateCost.trim()
        ? form.rateCost.trim().replace(/,/g, "")
        : null,
      rateCurrency:
        form.ratePrice.trim() || form.rateCost.trim()
          ? form.rateCurrency
          : null,
      status: form.status,
    };

    if (room) {
      const data: UpdateRoomPayload = {
        ...base,
        // null clears a description that was removed
        description: form.description.trim() || null,
      };
      update.updateRoom(
        { roomId: room.id, hotelId, data },
        { onSuccess: onClose },
      );
    } else {
      const payload: CreateRoomPayload = {
        ...base,
        hotelId,
        description: form.description.trim() || undefined,
      };
      create.createRoom(payload, { onSuccess: onClose });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit room" : "Add room"}
      description={
        isEdit
          ? `Update ${room!.name}.`
          : "Add a room type guests can be booked into at this hotel."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Room name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              aria-invalid={!!errors.name}
              aria-label="Room name"
              placeholder="e.g. Deluxe Valley View"
              className={inputCls}
            />
          </Field>

          <Field
            label="Room type"
            required
            error={errors.roomType}
            className="sm:col-span-2"
          >
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Common room types"
            >
              {ROOM_TYPES.map((t) => {
                const on = form.roomType.toLowerCase() === t.toLowerCase();
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setField("roomType", t)}
                    className={`h-8 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                      on
                        ? "bg-ink text-white"
                        : "bg-mist text-ink-soft hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <input
              value={form.roomType}
              onChange={(e) => setField("roomType", e.target.value)}
              aria-invalid={!!errors.roomType}
              aria-label="Room type"
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              aria-label="Description"
              rows={3}
              placeholder="Bed setup, view, size, amenities"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>

          <Field label="Max adults" error={errors.maxAdults}>
            <Stepper
              label="max adults"
              min={1}
              value={form.maxAdults}
              invalid={!!errors.maxAdults}
              onChange={(n) => setField("maxAdults", n)}
            />
          </Field>

          <Field label="Max children" error={errors.maxChildren}>
            <Stepper
              label="max children"
              min={0}
              value={form.maxChildren}
              invalid={!!errors.maxChildren}
              onChange={(n) => setField("maxChildren", n)}
            />
          </Field>

          <Field
            label="Number of rooms"
            hint="How many of this room the hotel has."
            error={errors.totalRooms}
          >
            <Stepper
              label="number of rooms"
              min={1}
              value={form.totalRooms}
              invalid={!!errors.totalRooms}
              onChange={(n) => setField("totalRooms", n)}
            />
          </Field>

          <Field label="Status">
            <div className="flex gap-1 rounded-full bg-mist p-1">
              {(["active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={form.status === s}
                  onClick={() => setField("status", s)}
                  className={`h-8 flex-1 rounded-full text-sm font-semibold capitalize transition-colors ${
                    form.status === s
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <div className="space-y-3 border-t border-line pt-5 sm:col-span-2">
            <div>
              <p className="text-sm font-semibold text-ink">
                Rate per room per night
              </p>
              <p className="text-xs text-ink-soft">
                Used to price this room automatically on bookings, converted
                into each booking&apos;s currency. Optional, and agents can
                still set a special price.
              </p>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr_1fr] gap-3">
              <Field label="Currency">
                <div className="relative">
                  <select
                    value={form.rateCurrency}
                    onChange={(e) => setField("rateCurrency", e.target.value)}
                    aria-label="Rate currency"
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {[...new Set([form.rateCurrency, ...RATE_CURRENCIES])].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      ),
                    )}
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
                error={errors.ratePrice}
                hint="Customer pays"
              >
                <input
                  inputMode="decimal"
                  value={form.ratePrice}
                  onChange={(e) => setField("ratePrice", e.target.value)}
                  aria-invalid={!!errors.ratePrice}
                  aria-label="Rate price per night"
                  placeholder="Not set"
                  className={`${inputCls} text-right font-semibold tabular-nums`}
                />
              </Field>
              <Field
                label="Cost"
                error={errors.rateCost}
                hint="You pay the hotel"
              >
                <input
                  inputMode="decimal"
                  value={form.rateCost}
                  onChange={(e) => setField("rateCost", e.target.value)}
                  aria-invalid={!!errors.rateCost}
                  aria-label="Rate cost per night"
                  placeholder="Not set"
                  className={`${inputCls} text-right tabular-nums`}
                />
              </Field>
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
