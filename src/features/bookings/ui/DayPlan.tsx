"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  Bus,
  ChevronDown,
  Compass,
  Loader2,
  Package,
  Plus,
  Ticket,
} from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import { formatPrice } from "@/src/lib/format";
import type { BookingItemType } from "../types/booking";
import {
  type DraftLine,
  LINE_TYPES,
  type LinePrice,
  type LineTotals,
  lineProblem,
  newLine,
} from "./dayPlanState";
import { useRooms } from "../../room/hooks/useRooms";

/** inputCls without its w-full, for boxes with their own width (w-full would win and squash neighbours). */
const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

/** Records for the pickers, loaded once by the booking page. */
export type PlanPickers = {
  hotels: { id: string; name: string; city: string }[];
  vehicles: {
    id: string;
    name: string;
    registrationNumber: string;
    driverId: string | null;
  }[];
  drivers: { id: string; name: string }[];
  guides: { id: string; name: string }[];
  services: { id: string; name: string }[];
};

const META: Record<
  BookingItemType,
  { label: string; icon: typeof BedDouble; per: string; qty: string }
> = {
  hotel: { label: "Hotel", icon: BedDouble, per: "night", qty: "Rooms" },
  vehicle: { label: "Vehicle", icon: Bus, per: "day", qty: "Vehicles" },
  guide: { label: "Guide", icon: Compass, per: "day", qty: "Guides" },
  service: { label: "Service", icon: Ticket, per: "each", qty: "Quantity" },
  other: { label: "Other charge", icon: Package, per: "each", qty: "Quantity" },
};

// ---------- small bits ----------

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
    </div>
  );
}

/** Keep the saved choice selectable even if it's since gone inactive. */
function withSaved<T extends { id: string }>(
  list: T[],
  id: string,
  fallback: () => T,
) {
  return id && !list.some((x) => x.id === id) ? [fallback(), ...list] : list;
}

const savedPart = (line: DraftLine, i: number, fallback: string) =>
  line.saved?.description.split(" · ")[i] ?? fallback;

// ---------- what a line is called ----------

/** "Le Meridien · Deluxe", "Prado (BP-1-A1234)" … from the pickers, or the saved name. */
function useLineTitle(line: DraftLine, pickers: PlanPickers) {
  const { rooms } = useRooms(line.type === "hotel" ? line.hotelId : "");
  switch (line.type) {
    case "hotel": {
      const h = pickers.hotels.find((x) => x.id === line.hotelId);
      const r = rooms.find((x) => x.id === line.hotelRoomId);
      if (!line.hotelId) return null;
      const hotelName = h?.name ?? savedPart(line, 0, "Hotel");
      const roomName =
        r?.name ?? (line.hotelRoomId ? savedPart(line, 1, "") : "");
      return roomName ? `${hotelName} · ${roomName}` : hotelName;
    }
    case "vehicle": {
      if (!line.vehicleId) return null;
      return (
        pickers.vehicles.find((x) => x.id === line.vehicleId)?.name ??
        savedPart(line, 0, "Vehicle").replace(/ \(.*\)$/, "")
      );
    }
    case "guide":
      return line.guideId
        ? (pickers.guides.find((x) => x.id === line.guideId)?.name ??
            line.saved?.description.replace(/^Guide · /, "") ??
            "Guide")
        : null;
    case "service":
      return line.serviceId
        ? (pickers.services.find((x) => x.id === line.serviceId)?.name ??
            line.saved?.description ??
            "Service")
        : null;
    case "other":
      return line.description.trim() || null;
  }
}

function lineDetail(line: DraftLine, pickers: PlanPickers) {
  const bits: string[] = [];
  if (line.type === "hotel")
    bits.push(
      `${line.quantity} room${line.quantity === 1 ? "" : "s"} · 1 night`,
    );
  else if (line.quantity > 1) bits.push(`× ${line.quantity}`);
  if (line.type === "vehicle") {
    const driver =
      pickers.drivers.find((d) => d.id === line.driverId)?.name ??
      (line.driverId ? savedPart(line, 1, "") : "");
    bits.push(driver ? `with ${driver}` : "no driver");
  }
  if (line.special != null) bits.push("special price");
  return bits.join(" · ");
}

// ---------- collapsed row price ----------

function RowPrice({
  line,
  price,
  currency,
}: {
  line: DraftLine;
  price: LinePrice | undefined;
  currency: string;
}) {
  const money = (v: string) => formatPrice(v, currency);
  if (!price || price.state === "incomplete")
    return <span className="text-sm text-ink-soft">—</span>;
  if (price.state === "loading")
    return (
      <Loader2
        size={15}
        className="animate-spin text-ink-soft"
        aria-label="Looking up the rate"
      />
    );
  if (price.state === "error" || price.state === "no-rate") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-marigold/20 px-2 py-0.5 text-xs font-semibold text-ink">
        <AlertTriangle size={12} aria-hidden="true" className="shrink-0" />{" "}
        {price.state === "error" ? "Rate unavailable" : "Needs a price"}
      </span>
    );
  }
  const total = (Number(price.unitPrice) * line.quantity).toFixed(2);
  const cost =
    price.unitCost == null
      ? null
      : (Number(price.unitCost) * line.quantity).toFixed(2);
  return (
    <span className="block text-right leading-tight">
      <span className="block whitespace-nowrap font-semibold tabular-nums text-ink">
        {money(total)}
      </span>
      <span className="block text-xs tabular-nums text-ink-soft">
        {cost != null ? `cost ${money(cost)}` : "no cost"}
      </span>
    </span>
  );
}

// ---------- editor (open row) ----------

function HotelFields({ line, set, pickers }: FieldProps) {
  const { rooms, isLoading } = useRooms(line.hotelId);
  const active = rooms.filter(
    (r) => r.status === "active" || r.id === line.hotelRoomId,
  );

  // One room type? Pick it, so the rate applies straight away.
  useEffect(() => {
    if (line.hotelId && !line.hotelRoomId && active.length === 1)
      set({ hotelRoomId: active[0]!.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.hotelId, line.hotelRoomId, active.length]);

  const hotels = withSaved(pickers.hotels, line.hotelId, () => ({
    id: line.hotelId,
    name: savedPart(line, 0, "Saved hotel"),
    city: "",
  }));
  return (
    <>
      <Select
        id={`${line.key}-hotel`}
        label="Hotel"
        value={line.hotelId}
        onChange={(v) => set({ hotelId: v, hotelRoomId: "" })}
      >
        <option value="">Choose a hotel</option>
        {hotels.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
            {h.city ? ` · ${h.city}` : ""}
          </option>
        ))}
      </Select>
      <Select
        id={`${line.key}-room`}
        label="Room type"
        value={line.hotelRoomId}
        onChange={(v) => set({ hotelRoomId: v })}
      >
        <option value="">
          {!line.hotelId
            ? "Choose a hotel first"
            : isLoading
              ? "Loading…"
              : active.length === 0
                ? "No room types — add them on the hotel page"
                : "Choose a room type"}
        </option>
        {active.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
            {r.ratePrice ? "" : " — no rate"}
          </option>
        ))}
      </Select>
    </>
  );
}

function VehicleFields({ line, set, pickers }: FieldProps) {
  const vehicles = withSaved(pickers.vehicles, line.vehicleId, () => ({
    id: line.vehicleId,
    name: savedPart(line, 0, "Saved vehicle"),
    registrationNumber: "",
    driverId: null,
  }));
  const drivers = withSaved(pickers.drivers, line.driverId, () => ({
    id: line.driverId,
    name: savedPart(line, 1, "Saved driver"),
  }));
  return (
    <>
      <Select
        id={`${line.key}-vehicle`}
        label="Vehicle"
        value={line.vehicleId}
        onChange={(v) => {
          // Use the vehicle's usual driver when none is chosen yet.
          const usual = pickers.vehicles.find((x) => x.id === v)?.driverId;
          set({ vehicleId: v, driverId: line.driverId || usual || "" });
        }}
      >
        <option value="">Choose a vehicle</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.registrationNumber ? ` (${v.registrationNumber})` : ""}
          </option>
        ))}
      </Select>
      <Select
        id={`${line.key}-driver`}
        label="Driver"
        value={line.driverId}
        onChange={(v) => set({ driverId: v })}
      >
        <option value="">No driver</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </Select>
    </>
  );
}

type FieldProps = {
  line: DraftLine;
  set: (patch: Partial<DraftLine>) => void;
  pickers: PlanPickers;
};

function PriceChoice({
  line,
  price,
  currency,
  set,
}: {
  line: DraftLine;
  price: LinePrice | undefined;
  currency: string;
  set: FieldProps["set"];
}) {
  const per = META[line.type].per;
  const rateText =
    price?.state === "ok" && price.fromRate
      ? `${formatPrice(price.unitPrice, currency)} / ${per}`
      : price?.state === "loading"
        ? "Looking up…"
        : price?.state === "error"
          ? "Couldn't load the rate"
          : price?.state === "no-rate"
            ? price.missingExchangeRate
              ? `No ${price.missingExchangeRate} exchange rate (Settings → Exchange rates)`
              : line.type === "hotel" && !line.hotelRoomId
                ? "Choose a room type to use its rate"
                : `No rate set on this ${META[line.type].label.toLowerCase()}`
            : "Choose the details first";
  const special = line.special != null;

  if (line.type === "other") {
    return (
      <div>
        <label
          htmlFor={`${line.key}-price`}
          className="mb-1 block text-xs font-semibold text-ink-soft"
        >
          Price ({currency})
        </label>
        <input
          id={`${line.key}-price`}
          inputMode="decimal"
          placeholder="0.00"
          value={line.special ?? ""}
          onChange={(e) => set({ special: e.target.value })}
          className={`${inputCls} tabular-nums`}
        />
      </div>
    );
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 text-xs font-semibold text-ink-soft">
        Price
      </legend>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`${line.key}-price`}
            checked={!special}
            onChange={() => set({ special: null })}
            className="accent-lagoon-deep"
          />
          <span>
            Rate <span className="text-ink-soft">· {rateText}</span>
          </span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`${line.key}-price`}
            checked={special}
            onChange={() =>
              set({
                special:
                  price?.state === "ok" ? String(Number(price.unitPrice)) : "",
              })
            }
            className="accent-lagoon-deep"
          />
          Special price
        </label>
        {special && (
          <input
            aria-label={`Special price per ${per} (${currency})`}
            inputMode="decimal"
            placeholder={`${currency} / ${per}`}
            value={line.special ?? ""}
            onChange={(e) => set({ special: e.target.value })}
            className={`${sizedInputCls} h-9 w-32 shrink-0 text-right tabular-nums`}
          />
        )}
      </div>
    </fieldset>
  );
}

// ---------- one line ----------

function LineRow({
  line,
  price,
  currency,
  readOnly,
  pickers,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  line: DraftLine;
  price: LinePrice | undefined;
  currency: string;
  readOnly: boolean;
  pickers: PlanPickers;
  open: boolean;
  onToggle: () => void;
  onChange: (line: DraftLine) => void;
  onRemove: () => void;
}) {
  const M = META[line.type];
  const title = useLineTitle(line, pickers);
  const detail = lineDetail(line, pickers);
  const set = (patch: Partial<DraftLine>) => onChange({ ...line, ...patch });
  const problem = lineProblem(line);

  return (
    <li className={open ? "rounded-xl bg-mist/60" : ""}>
      <button
        type="button"
        onClick={onToggle}
        disabled={readOnly}
        aria-expanded={readOnly ? undefined : open}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-mist/60 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep">
          <M.icon size={15} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-medium ${title ? "text-ink" : "text-ink-soft"}`}
          >
            {title ?? `New ${M.label.toLowerCase()} — choose…`}
          </span>
          {detail && (
            <span className="block truncate text-xs text-ink-soft">
              {detail}
            </span>
          )}
        </span>
        <span className="shrink-0">
          <RowPrice line={line} price={price} currency={currency} />
        </span>
        {!readOnly && (
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && !readOnly && (
        <div className="grid gap-3 px-3 pb-3 pt-1 sm:grid-cols-2">
          {line.type === "hotel" && (
            <HotelFields line={line} set={set} pickers={pickers} />
          )}
          {line.type === "vehicle" && (
            <VehicleFields line={line} set={set} pickers={pickers} />
          )}
          {line.type === "guide" && (
            <Select
              id={`${line.key}-guide`}
              label="Guide"
              value={line.guideId}
              onChange={(v) => set({ guideId: v })}
            >
              <option value="">Choose a guide</option>
              {withSaved(pickers.guides, line.guideId, () => ({
                id: line.guideId,
                name: title ?? "Saved guide",
              })).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          )}
          {line.type === "service" && (
            <Select
              id={`${line.key}-service`}
              label="Service"
              value={line.serviceId}
              onChange={(v) => set({ serviceId: v })}
            >
              <option value="">Choose a service</option>
              {withSaved(pickers.services, line.serviceId, () => ({
                id: line.serviceId,
                name: title ?? "Saved service",
              })).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
          {line.type === "other" && (
            <div>
              <label
                htmlFor={`${line.key}-desc`}
                className="mb-1 block text-xs font-semibold text-ink-soft"
              >
                What is it?
              </label>
              <input
                id={`${line.key}-desc`}
                placeholder="e.g. Airport transfer, permit"
                value={line.description}
                onChange={(e) => set({ description: e.target.value })}
                className={inputCls}
              />
            </div>
          )}

          <div
            className={
              line.type === "guide" || line.type === "service"
                ? ""
                : "sm:max-w-[10rem]"
            }
          >
            <label
              htmlFor={`${line.key}-qty`}
              className="mb-1 block text-xs font-semibold text-ink-soft"
            >
              {M.qty}
            </label>
            <input
              id={`${line.key}-qty`}
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={line.quantity}
              onChange={(e) =>
                set({
                  quantity: Math.max(
                    1,
                    Math.min(500, Number(e.target.value) || 1),
                  ),
                })
              }
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <PriceChoice
            line={line}
            price={price}
            currency={currency}
            set={set}
          />

          {price?.state === "ok" && price.extraCost && (
            <p className="text-xs text-ink-soft sm:col-span-2">
              Cost includes {price.extraCost.label}:{" "}
              {formatPrice(price.extraCost.converted, currency)}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 sm:col-span-2">
            <button
              type="button"
              onClick={onRemove}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
            <div className="flex items-center gap-3">
              {problem && (
                <span className="text-xs text-ink-soft">{problem}</span>
              )}
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-8 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

// ---------- add menu ----------

function AddMenu({ onAdd }: { onAdd: (type: BookingItemType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold text-lagoon-deep hover:bg-lagoon-tint"
      >
        <Plus size={14} aria-hidden="true" /> Add to day
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-line bg-white p-1 shadow-lg"
        >
          {LINE_TYPES.map((t) => {
            const M = META[t];
            return (
              <button
                key={t}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAdd(t);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-lagoon-tint hover:text-lagoon-deep"
              >
                <M.icon size={15} aria-hidden="true" /> {M.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- day plan ----------

/** What's used on one day, each line priced from its rate, and the day's totals. */
export function DayPlan({
  lines,
  onChange,
  prices,
  totals,
  currency,
  readOnly,
  pickers,
}: {
  lines: DraftLine[];
  onChange: (lines: DraftLine[]) => void;
  prices: Map<string, LinePrice>;
  totals: LineTotals;
  currency: string;
  readOnly: boolean;
  pickers: PlanPickers;
}) {
  /** One line open for editing at a time. */
  const [openKey, setOpenKey] = useState<string | null>(null);
  const money = (v: string) => formatPrice(v, currency);
  const sorted = [...lines].sort(
    (a, b) => LINE_TYPES.indexOf(a.type) - LINE_TYPES.indexOf(b.type),
  );
  const margin =
    totals.priceCents > 0 && totals.withoutCost === 0
      ? Math.round(
          ((totals.priceCents - totals.costCents) / totals.priceCents) * 100,
        )
      : null;

  if (readOnly && lines.length === 0) return null;

  return (
    <div className="mt-4 border-t border-line pt-2">
      {lines.length > 0 && (
        <ul className="space-y-0.5">
          {sorted.map((l) => (
            <LineRow
              key={l.key}
              line={l}
              price={prices.get(l.key)}
              currency={currency}
              readOnly={readOnly}
              pickers={pickers}
              open={openKey === l.key}
              onToggle={() => setOpenKey((k) => (k === l.key ? null : l.key))}
              onChange={(next) =>
                onChange(lines.map((x) => (x.key === l.key ? next : x)))
              }
              onRemove={() => {
                onChange(lines.filter((x) => x.key !== l.key));
                setOpenKey(null);
              }}
            />
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-1">
        {!readOnly ? (
          <AddMenu
            onAdd={(type) => {
              const line = newLine(type);
              onChange([...lines, line]);
              setOpenKey(line.key);
            }}
          />
        ) : (
          <span />
        )}

        {lines.length > 0 && (
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">
              Day total {money(totals.price)}
            </span>
            <span className="tabular-nums">
              {" · "}cost {money(totals.cost)}
              {" · "}profit{" "}
              <span
                className={
                  totals.priceCents - totals.costCents < 0 ? "text-red-600" : ""
                }
              >
                {money(totals.profit)}
              </span>
              {margin != null && ` (${margin}%)`}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
