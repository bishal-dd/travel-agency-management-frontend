"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Bus,
  ChevronDown,
  Compass,
  History,
  Package,
  Ticket,
} from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { useHotels } from "../../hotel/hooks/useHotels";

import {
  Field,
  FormFooter,
  ServerError,
  inputCls,
} from "../../shared/components/FormBits";
import {
  useCreateBookingItem,
  useUpdateBookingItem,
} from "../hooks/useBookingItemMutations";
import { useLastPrice } from "../hooks/useLastPrice";
import type {
  BookingDetail,
  BookingItem,
  BookingItemInput,
  BookingItemType,
  LastPriceParams,
} from "../types/booking";
import { addDays, formatDate, tripLength } from "./bookingUi";
import { formatPrice } from "@/src/lib/format";
import { useDrivers } from "../../driver/hooks/useDrivers";
import { useGuides } from "../../guide/hooks/useGuides";
import { useRooms } from "../../room/hooks/useRooms";
import { useServices } from "../../service/hooks/useServices";
import { useVehicles } from "../../vehicle/hooks/useVehicles";

/** Pickers load active records once each. Keep ≤ your backend's max `limit`. */
const PICKER_LIMIT = 100;

export const ITEM_TYPE_META: Record<
  BookingItemType,
  { label: string; plural: string; icon: typeof BedDouble }
> = {
  hotel: { label: "Hotel", plural: "Hotels", icon: BedDouble },
  vehicle: { label: "Vehicle", plural: "Transport", icon: Bus },
  guide: { label: "Guide", plural: "Guides", icon: Compass },
  service: { label: "Service", plural: "Services", icon: Ticket },
  other: { label: "Other", plural: "Other", icon: Package },
};

type Form = {
  type: BookingItemType;
  hotelId: string;
  hotelRoomId: string;
  vehicleId: string;
  driverId: string;
  guideId: string;
  serviceId: string;
  startDate: string; // check-in for hotels, the date for service / other
  endDate: string; // check-out for hotels
  quantity: string;
  unitPrice: string;
  unitCost: string;
  description: string;
  notes: string;
};

function emptyForm(type: BookingItemType, booking: BookingDetail): Form {
  const start = booking.startDate;
  return {
    type,
    hotelId: "",
    hotelRoomId: "",
    vehicleId: "",
    driverId: "",
    guideId: "",
    serviceId: "",
    startDate: start,
    // Sensible defaults: one night for hotels, the whole trip for vehicles and guides.
    endDate: type === "hotel" ? addDays(start, 1) : booking.endDate,
    quantity: "1",
    unitPrice: "",
    unitCost: "",
    description: "",
    notes: "",
  };
}

function formFromItem(item: BookingItem): Form {
  return {
    type: item.type,
    hotelId: item.hotelId ?? "",
    hotelRoomId: item.hotelRoomId ?? "",
    vehicleId: item.vehicleId ?? "",
    driverId: item.driverId ?? "",
    guideId: item.guideId ?? "",
    serviceId: item.serviceId ?? "",
    startDate: item.startDate,
    endDate: item.endDate,
    quantity: String(item.quantity),
    unitPrice: String(Number(item.unitPrice)),
    unitCost: item.unitCost == null ? "" : String(Number(item.unitCost)),
    description: item.description,
    notes: item.notes ?? "",
  };
}

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));

function Select({
  id,
  value,
  onChange,
  children,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={`${inputCls} appearance-none pr-9`}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
  /** Edit this item; leave null to add. */
  item?: BookingItem | null;
  /** When adding: which type to start with. */
  initialType?: BookingItemType;
};

export function BookingItemDialog({
  open,
  onClose,
  booking,
  item,
  initialType = "hotel",
}: Props) {
  const isEdit = !!item;
  const create = useCreateBookingItem();
  const update = useUpdateBookingItem();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<Form>(() => emptyForm(initialType, booking));
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  // Once the agent types a price, never overwrite it with a suggestion.
  const [priceTouched, setPriceTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(item ? formFromItem(item) : emptyForm(initialType, booking));
    setErrors({});
    setPriceTouched(isEdit);
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, initialType]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // ----- pickers (active records only; keep the current one if it's since gone inactive) -----
  const { hotels } = useHotels({ status: "active", limit: PICKER_LIMIT });
  const { rooms } = useRooms(form.type === "hotel" ? form.hotelId : "");
  const { vehicles } = useVehicles({ status: "active", limit: PICKER_LIMIT });
  const { drivers } = useDrivers({ status: "active", limit: PICKER_LIMIT });
  const { guides } = useGuides({ status: "active", limit: PICKER_LIMIT });
  const { services } = useServices({ status: "active", limit: PICKER_LIMIT });

  const service = services.find((s) => s.id === form.serviceId);
  const vehicle = vehicles.find((v) => v.id === form.vehicleId);

  // ----- last price used -----
  const lastPriceParams = useMemo<LastPriceParams | null>(() => {
    const currency = booking.currency;
    if (form.type === "hotel" && form.hotelRoomId)
      return { hotelRoomId: form.hotelRoomId, currency };
    if (form.type === "hotel" && form.hotelId)
      return { hotelId: form.hotelId, currency };
    if (form.type === "vehicle" && form.vehicleId)
      return { vehicleId: form.vehicleId, currency };
    if (form.type === "guide" && form.guideId)
      return { guideId: form.guideId, currency };
    if (form.type === "service" && form.serviceId)
      return { serviceId: form.serviceId, currency };
    return null;
  }, [
    form.type,
    form.hotelId,
    form.hotelRoomId,
    form.vehicleId,
    form.guideId,
    form.serviceId,
    booking.currency,
  ]);

  const { data: lastPrice } = useLastPrice(lastPriceParams);

  // Fill the price from the last booking, or from the service's own price if it's in this currency.
  useEffect(() => {
    if (priceTouched) return;
    if (lastPrice) {
      setForm((f) => ({
        ...f,
        unitPrice: String(Number(lastPrice.unitPrice)),
        unitCost:
          lastPrice.unitCost == null
            ? f.unitCost
            : String(Number(lastPrice.unitCost)),
      }));
    } else if (
      form.type === "service" &&
      service &&
      service.currency === booking.currency
    ) {
      setForm((f) => ({ ...f, unitPrice: String(Number(service.price)) }));
    }
  }, [lastPrice, service, form.type, booking.currency, priceTouched]);

  // ----- derived numbers -----
  const span =
    form.startDate && form.endDate
      ? tripLength(form.startDate, form.endDate)
      : 0;
  const units =
    form.type === "hotel"
      ? Math.max(0, span - 1)
      : form.type === "vehicle" || form.type === "guide"
        ? Math.max(0, span)
        : 1;
  const per =
    form.type === "hotel"
      ? "night"
      : form.type === "vehicle" || form.type === "guide"
        ? "day"
        : "unit";
  const qty = Number(form.quantity) || 0;
  const price = isMoney(form.unitPrice)
    ? Number(form.unitPrice.replace(/,/g, ""))
    : 0;
  const cost = isMoney(form.unitCost)
    ? Number(form.unitCost.replace(/,/g, ""))
    : null;
  // Rounded to cents only for display; the server computes the real totals exactly.
  const lineTotal = Math.round(qty * units * price * 100) / 100;
  const lineCost =
    cost == null ? null : Math.round(qty * units * cost * 100) / 100;

  const lastAllowed =
    form.type === "hotel" ? addDays(booking.endDate, 1) : booking.endDate;

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (form.type === "hotel" && !form.hotelId) e.hotelId = "Choose a hotel.";
    if (form.type === "vehicle" && !form.vehicleId)
      e.vehicleId = "Choose a vehicle.";
    if (form.type === "guide" && !form.guideId) e.guideId = "Choose a guide.";
    if (form.type === "service" && !form.serviceId)
      e.serviceId = "Choose a service.";
    if (form.type === "other" && !form.description.trim())
      e.description = "Describe this item.";

    if (!form.startDate) e.startDate = "Choose a date.";
    else if (
      form.startDate < booking.startDate ||
      form.startDate > booking.endDate
    )
      e.startDate = `Within the trip: ${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}.`;

    if (form.type === "hotel") {
      if (!form.endDate || form.endDate <= form.startDate)
        e.endDate = "At least one night after check-in.";
      else if (form.endDate > lastAllowed)
        e.endDate = `Check-out by ${formatDate(lastAllowed)}.`;
    }
    if (form.type === "vehicle" || form.type === "guide") {
      if (!form.endDate || form.endDate < form.startDate)
        e.endDate = "On or after the start date.";
      else if (form.endDate > booking.endDate)
        e.endDate = `By ${formatDate(booking.endDate)}.`;
    }

    if (!Number.isInteger(qty) || qty < 1) e.quantity = "At least 1.";
    if (!isMoney(form.unitPrice))
      e.unitPrice = "Enter a price like 120 or 45.50.";
    if (form.unitCost.trim() && !isMoney(form.unitCost))
      e.unitCost = "Enter a cost like 90 or 35.50.";
    return e;
  }

  function toInput(): BookingItemInput {
    const money = {
      quantity: qty,
      unitPrice: form.unitPrice.trim().replace(/,/g, ""),
      unitCost: form.unitCost.trim()
        ? form.unitCost.trim().replace(/,/g, "")
        : null,
      // Empty = let the server name it from the linked record.
      description: form.description.trim() || undefined,
      notes: form.notes.trim() || null,
    };
    switch (form.type) {
      case "hotel":
        return {
          type: "hotel",
          hotelId: form.hotelId,
          hotelRoomId: form.hotelRoomId || null,
          checkIn: form.startDate,
          checkOut: form.endDate,
          ...money,
        };
      case "vehicle":
        return {
          type: "vehicle",
          vehicleId: form.vehicleId,
          driverId: form.driverId || null,
          startDate: form.startDate,
          endDate: form.endDate,
          ...money,
        };
      case "guide":
        return {
          type: "guide",
          guideId: form.guideId,
          startDate: form.startDate,
          endDate: form.endDate,
          ...money,
        };
      case "service":
        return {
          type: "service",
          serviceId: form.serviceId,
          date: form.startDate,
          ...money,
        };
      case "other":
        return {
          type: "other",
          date: form.startDate,
          ...money,
          description: form.description.trim(),
        };
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    if (item) {
      update.mutate(
        { bookingId: booking.id, itemId: item.id, item: toInput() },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        { bookingId: booking.id, item: toInput() },
        { onSuccess: onClose },
      );
    }
  }

  // Changing type resets the type-specific fields but keeps price / notes.
  function changeType(type: BookingItemType) {
    const fresh = emptyForm(type, booking);
    setForm((f) => ({
      ...fresh,
      unitPrice: priceTouched ? f.unitPrice : "",
      unitCost: priceTouched ? f.unitCost : "",
      notes: f.notes,
    }));
    setErrors({});
  }

  const money = (n: number) => formatPrice(n.toFixed(2), booking.currency);
  const dateInput = (
    id: keyof Form,
    label: string,
    min?: string,
    max?: string,
  ) => (
    <Field label={label} htmlFor={`bi-${id}`} required error={errors[id]}>
      <input
        id={`bi-${id}`}
        type="date"
        min={min}
        max={max}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        aria-invalid={!!errors[id]}
        className={inputCls}
      />
    </Field>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={
        isEdit
          ? `Edit ${ITEM_TYPE_META[form.type].label.toLowerCase()}`
          : "Add item"
      }
      description={`${booking.reference} · prices in ${booking.currency}`}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          {!isEdit && (
            <div
              className="grid grid-cols-5 gap-1.5 sm:col-span-2"
              role="radiogroup"
              aria-label="Item type"
            >
              {(Object.keys(ITEM_TYPE_META) as BookingItemType[]).map((t) => {
                const M = ITEM_TYPE_META[t];
                const on = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => changeType(t)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs font-semibold transition-colors ${
                      on
                        ? "border-lagoon-deep bg-lagoon-tint text-lagoon-deep"
                        : "border-line text-ink-soft hover:border-ink/30 hover:text-ink"
                    }`}
                  >
                    <M.icon size={18} aria-hidden="true" />
                    {M.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* ----- what ----- */}
          {form.type === "hotel" && (
            <>
              <Field
                label="Hotel"
                htmlFor="bi-hotel"
                required
                error={errors.hotelId}
              >
                <Select
                  id="bi-hotel"
                  value={form.hotelId}
                  onChange={(v) => {
                    set("hotelId", v);
                    set("hotelRoomId", "");
                  }}
                  invalid={!!errors.hotelId}
                >
                  <option value="">Choose a hotel</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} · {h.city}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Room type"
                htmlFor="bi-room"
                hint={
                  form.hotelId && !rooms.length
                    ? "No rooms set up for this hotel."
                    : undefined
                }
              >
                <Select
                  id="bi-room"
                  value={form.hotelRoomId}
                  onChange={(v) => set("hotelRoomId", v)}
                >
                  <option value="">
                    {form.hotelId
                      ? "Any / not decided"
                      : "Choose a hotel first"}
                  </option>
                  {rooms
                    .filter(
                      (r) => r.status === "active" || r.id === form.hotelRoomId,
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {r.roomType}
                      </option>
                    ))}
                </Select>
              </Field>
              {dateInput(
                "startDate",
                "Check-in",
                booking.startDate,
                booking.endDate,
              )}
              {dateInput(
                "endDate",
                "Check-out",
                addDays(form.startDate || booking.startDate, 1),
                lastAllowed,
              )}
            </>
          )}

          {form.type === "vehicle" && (
            <>
              <Field
                label="Vehicle"
                htmlFor="bi-vehicle"
                required
                error={errors.vehicleId}
              >
                <Select
                  id="bi-vehicle"
                  value={form.vehicleId}
                  onChange={(v) => {
                    set("vehicleId", v);
                    // Default to the vehicle's usual driver.
                    const vv = vehicles.find((x) => x.id === v);
                    if (vv?.driverId && !form.driverId)
                      set("driverId", vv.driverId);
                  }}
                  invalid={!!errors.vehicleId}
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.registrationNumber} · {v.seatingCapacity}{" "}
                      seats
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Driver"
                htmlFor="bi-driver"
                hint={
                  vehicle?.driverId && vehicle.driverId === form.driverId
                    ? "Usual driver for this vehicle"
                    : undefined
                }
              >
                <Select
                  id="bi-driver"
                  value={form.driverId}
                  onChange={(v) => set("driverId", v)}
                >
                  <option value="">No driver / not decided</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.phone}
                    </option>
                  ))}
                </Select>
              </Field>
              {dateInput(
                "startDate",
                "From",
                booking.startDate,
                booking.endDate,
              )}
              {dateInput(
                "endDate",
                "To",
                form.startDate || booking.startDate,
                booking.endDate,
              )}
            </>
          )}

          {form.type === "guide" && (
            <>
              <Field
                label="Guide"
                htmlFor="bi-guide"
                required
                error={errors.guideId}
                className="sm:col-span-2"
              >
                <Select
                  id="bi-guide"
                  value={form.guideId}
                  onChange={(v) => set("guideId", v)}
                  invalid={!!errors.guideId}
                >
                  <option value="">Choose a guide</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                      {g.languages?.length
                        ? ` · ${g.languages.join(", ")}`
                        : ""}
                    </option>
                  ))}
                </Select>
              </Field>
              {dateInput(
                "startDate",
                "From",
                booking.startDate,
                booking.endDate,
              )}
              {dateInput(
                "endDate",
                "To",
                form.startDate || booking.startDate,
                booking.endDate,
              )}
            </>
          )}

          {form.type === "service" && (
            <>
              <Field
                label="Service"
                htmlFor="bi-service"
                required
                error={errors.serviceId}
                hint={
                  service && service.currency !== booking.currency
                    ? `Listed at ${formatPrice(service.price, service.currency)}. Enter the ${booking.currency} price below.`
                    : undefined
                }
              >
                <Select
                  id="bi-service"
                  value={form.serviceId}
                  onChange={(v) => set("serviceId", v)}
                  invalid={!!errors.serviceId}
                >
                  <option value="">Choose a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {formatPrice(s.price, s.currency)}
                    </option>
                  ))}
                </Select>
              </Field>
              {dateInput(
                "startDate",
                "Date",
                booking.startDate,
                booking.endDate,
              )}
            </>
          )}

          {form.type === "other" && (
            <>
              <Field
                label="What is it?"
                htmlFor="bi-description"
                required
                error={errors.description}
              >
                <input
                  id="bi-description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  aria-invalid={!!errors.description}
                  placeholder="e.g. Farewell dinner at Babesa Village"
                  className={inputCls}
                />
              </Field>
              {dateInput(
                "startDate",
                "Date",
                booking.startDate,
                booking.endDate,
              )}
            </>
          )}

          {/* ----- price ----- */}
          <div className="grid grid-cols-3 gap-3 border-t border-line pt-5 sm:col-span-2">
            <Field
              label={
                form.type === "hotel"
                  ? "Rooms"
                  : form.type === "vehicle"
                    ? "Vehicles"
                    : form.type === "guide"
                      ? "Guides"
                      : "Quantity"
              }
              htmlFor="bi-qty"
              error={errors.quantity}
            >
              <input
                id="bi-qty"
                type="number"
                inputMode="numeric"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label={`Price / ${per}`}
              htmlFor="bi-price"
              required
              error={errors.unitPrice}
            >
              <input
                id="bi-price"
                inputMode="decimal"
                value={form.unitPrice}
                onChange={(e) => {
                  setPriceTouched(true);
                  set("unitPrice", e.target.value);
                }}
                aria-invalid={!!errors.unitPrice}
                placeholder="0"
                className={`${inputCls} text-right font-semibold tabular-nums`}
              />
            </Field>
            <Field
              label={`Cost / ${per}`}
              htmlFor="bi-cost"
              error={errors.unitCost}
              hint="What you pay"
            >
              <input
                id="bi-cost"
                inputMode="decimal"
                value={form.unitCost}
                onChange={(e) => {
                  setPriceTouched(true);
                  set("unitCost", e.target.value);
                }}
                placeholder="Optional"
                className={`${inputCls} text-right tabular-nums`}
              />
            </Field>
          </div>

          {lastPrice && (
            <p className="-mt-2 flex items-center gap-1.5 text-xs text-ink-soft sm:col-span-2">
              <History size={13} aria-hidden="true" />
              Last used {formatPrice(lastPrice.unitPrice, booking.currency)}
              {lastPrice.unitCost != null &&
                ` (cost ${formatPrice(lastPrice.unitCost, booking.currency)})`}{" "}
              on {lastPrice.bookingReference}
              {priceTouched && (
                <button
                  type="button"
                  onClick={() => {
                    set("unitPrice", String(Number(lastPrice.unitPrice)));
                    if (lastPrice.unitCost != null)
                      set("unitCost", String(Number(lastPrice.unitCost)));
                  }}
                  className="ml-1 font-semibold text-lagoon-deep hover:underline"
                >
                  Use it
                </button>
              )}
            </p>
          )}

          {/* Live total */}
          <div className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 sm:col-span-2">
            <p className="text-sm text-ink-soft">
              {qty || 0} × {units} {per}
              {units === 1 ? "" : "s"} × {money(price)}
            </p>
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums text-ink">
                {money(lineTotal)}
              </p>
              {lineCost != null && (
                <p className="text-xs tabular-nums text-ink-soft">
                  Cost {money(lineCost)} · profit {money(lineTotal - lineCost)}
                </p>
              )}
            </div>
          </div>

          {form.type !== "other" && (
            <Field
              label="Description"
              htmlFor="bi-desc"
              className="sm:col-span-2"
              hint="Leave empty to use the name, e.g. “Hotel Druk · Deluxe”."
            >
              <input
                id="bi-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Notes" htmlFor="bi-notes" className="sm:col-span-2">
            <textarea
              id="bi-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Confirmation number, pickup time, special requests…"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save item" : "Add item"}
        />
      </form>
    </Modal>
  );
}
