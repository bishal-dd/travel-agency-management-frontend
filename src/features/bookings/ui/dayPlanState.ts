import type {
  BookingDay,
  BookingItem,
  BookingItemType,
  DayLineInput,
  DefaultPrice,
  DefaultPriceParams,
} from "../types/booking";

/**
 * One thing used on a day, as the editor holds it.
 * Prices come from the rates; `special` is a price the agent typed instead.
 */
export type DraftLine = {
  /** Stable React key: the saved line id, or a temporary one. */
  key: string;
  /** Saved line id (sent back so the saved price is kept). */
  id?: string;
  type: BookingItemType;
  hotelId: string;
  hotelRoomId: string;
  vehicleId: string;
  driverId: string;
  guideId: string;
  serviceId: string;
  /** Only for "other". */
  description: string;
  quantity: number;
  /** null = use the rate. A typed amount like "95" otherwise. */
  special: string | null;
  /** What the server saved, shown while nothing about the line has changed. */
  saved: {
    refs: string;
    unitPrice: string;
    unitCost: string | null;
    priceSource: "rate" | "manual";
    description: string;
  } | null;
};

/** The order lines are shown in, and the "Add" buttons. */
export const LINE_TYPES = [
  "hotel",
  "vehicle",
  "guide",
  "service",
  "other",
] as const satisfies readonly BookingItemType[];

const tempKey = () => `new-${Math.random().toString(36).slice(2, 10)}`;

/** Which resources the line points at; a change means it needs a new price. */
export const refsOf = (
  l: Pick<
    DraftLine,
    | "type"
    | "hotelId"
    | "hotelRoomId"
    | "vehicleId"
    | "driverId"
    | "guideId"
    | "serviceId"
  >,
) =>
  [
    l.type,
    l.hotelId,
    l.hotelRoomId,
    l.vehicleId,
    l.driverId,
    l.guideId,
    l.serviceId,
  ].join("|");

export function newLine(
  type: BookingItemType,
  from?: Partial<DraftLine>,
): DraftLine {
  return {
    key: tempKey(),
    type,
    hotelId: "",
    hotelRoomId: "",
    vehicleId: "",
    driverId: "",
    guideId: "",
    serviceId: "",
    description: "",
    quantity: 1,
    special: null,
    saved: null,
    ...from,
  };
}

export function lineFromItem(item: BookingItem): DraftLine {
  const line: DraftLine = {
    key: item.id,
    id: item.id,
    type: item.type,
    hotelId: item.hotelId ?? "",
    hotelRoomId: item.hotelRoomId ?? "",
    vehicleId: item.vehicleId ?? "",
    driverId: item.driverId ?? "",
    guideId: item.guideId ?? "",
    serviceId: item.serviceId ?? "",
    description: item.type === "other" ? item.description : "",
    quantity: item.quantity,
    special:
      item.priceSource === "rate" ? null : String(Number(item.unitPrice)),
    saved: null,
  };
  line.saved = {
    refs: refsOf(line),
    unitPrice: item.unitPrice,
    unitCost: item.unitCost,
    priceSource: item.priceSource ?? "manual",
    description: item.description,
  };
  return line;
}

export const linesFromDay = (day: BookingDay): DraftLine[] =>
  (day.lines ?? []).map(lineFromItem);

/** A new day starts with the previous day's vehicle, driver and guide. */
export const carryOverLines = (
  previous: DraftLine[] | undefined,
): DraftLine[] =>
  (previous ?? [])
    .filter((l) => l.type === "vehicle" || l.type === "guide")
    .map((l) =>
      newLine(l.type, {
        vehicleId: l.vehicleId,
        driverId: l.driverId,
        guideId: l.guideId,
        quantity: l.quantity,
      }),
    );

export function lineToInput(l: DraftLine): DayLineInput {
  const base = {
    ...(l.id ? { id: l.id } : {}),
    quantity: l.quantity,
    ...(l.special != null ? { unitPrice: l.special } : {}),
  };
  switch (l.type) {
    case "hotel":
      return {
        ...base,
        type: "hotel",
        hotelId: l.hotelId,
        hotelRoomId: l.hotelRoomId || null,
      };
    case "vehicle":
      return {
        ...base,
        type: "vehicle",
        vehicleId: l.vehicleId,
        driverId: l.driverId || null,
      };
    case "guide":
      return { ...base, type: "guide", guideId: l.guideId };
    case "service":
      return { ...base, type: "service", serviceId: l.serviceId };
    case "other":
      return {
        ...base,
        type: "other",
        description: l.description.trim(),
        unitPrice: l.special ?? "",
      };
  }
}

/** What's missing before the line can be saved, or null. */
export function lineProblem(l: DraftLine): string | null {
  if (l.type === "hotel" && !l.hotelId) return "Choose a hotel";
  if (l.type === "vehicle" && !l.vehicleId) return "Choose a vehicle";
  if (l.type === "guide" && !l.guideId) return "Choose a guide";
  if (l.type === "service" && !l.serviceId) return "Choose a service";
  if (l.type === "other" && !l.description.trim())
    return "Describe this charge";
  if (
    l.special != null &&
    !/^\d{1,8}(\.\d{1,2})?$/.test(l.special.trim().replace(/,/g, ""))
  ) {
    return "Enter a price like 120 or 45.50";
  }
  return null;
}

/** Ask the server for the rate only when the saved price can't be shown. */
export function previewParams(
  l: DraftLine,
  bookingId: string,
): DefaultPriceParams | null {
  if (l.saved && l.saved.refs === refsOf(l)) return null;
  if (l.type === "hotel" && l.hotelRoomId)
    return { bookingId, hotelRoomId: l.hotelRoomId };
  if (l.type === "vehicle" && l.vehicleId) {
    return l.driverId
      ? { bookingId, vehicleId: l.vehicleId, driverId: l.driverId }
      : { bookingId, vehicleId: l.vehicleId };
  }
  if (l.type === "guide" && l.guideId) return { bookingId, guideId: l.guideId };
  if (l.type === "service" && l.serviceId)
    return { bookingId, serviceId: l.serviceId };
  return null;
}

export type LinePrice =
  | {
      state: "ok";
      unitPrice: string;
      unitCost: string | null;
      fromRate: boolean;
      extraCost: DefaultPrice["extraCost"];
    }
  | { state: "loading" }
  | { state: "incomplete" }
  /** The rate lookup failed (e.g. the server is down or the route is missing). */
  | { state: "error" }
  /** No rate to price from: the agent needs to set a special price. */
  | {
      state: "no-rate";
      missingExchangeRate: string | null;
      sourceCurrency?: string;
    };

/**
 * The line's per-unit price and cost (one night or one day per line).
 * `preview` is the rate lookup for this line, if one was needed.
 */
export function priceLine(
  l: DraftLine,
  preview:
    | {
        data: DefaultPrice | null | undefined;
        isLoading: boolean;
        isError?: boolean;
      }
    | undefined,
): LinePrice {
  const unchanged = !!l.saved && l.saved.refs === refsOf(l);
  if (unchanged) {
    // Saved line: its price, or the special one; cost as saved.
    return {
      state: "ok",
      unitPrice: l.special ?? l.saved!.unitPrice,
      unitCost: l.saved!.unitCost,
      fromRate: l.special == null,
      extraCost: null,
    };
  }
  if (preview?.isLoading) return { state: "loading" };
  if (preview?.isError && l.special == null) return { state: "error" };
  const rate = preview?.data;
  if (l.special != null) {
    return {
      state: "ok",
      unitPrice: l.special,
      unitCost: rate?.unitCost ?? null,
      fromRate: false,
      extraCost: rate?.extraCost ?? null,
    };
  }
  if (!preview) {
    // A hotel without a room type has no rate to use; anything else isn't chosen yet.
    return l.type === "hotel" && l.hotelId
      ? { state: "no-rate", missingExchangeRate: null }
      : { state: "incomplete" };
  }
  if (rate?.unitPrice) {
    return {
      state: "ok",
      unitPrice: rate.unitPrice,
      unitCost: rate.unitCost,
      fromRate: true,
      extraCost: rate.extraCost ?? null,
    };
  }
  return {
    state: "no-rate",
    missingExchangeRate: rate?.missingExchangeRate ?? null,
    sourceCurrency: rate?.source.currency,
  };
}

const cents = (v: string) => Math.round(Number(v.replace(/,/g, "")) * 100);
const money = (c: number) => (c / 100).toFixed(2);

/** A day's totals from its line prices (works before saving). */
export function sumLines(lines: DraftLine[], prices: Map<string, LinePrice>) {
  let price = 0;
  let cost = 0;
  let withoutCost = 0;
  let needsPrice = 0;
  let pending = 0;
  for (const l of lines) {
    const p = prices.get(l.key);
    if (!p || p.state === "incomplete") continue;
    if (p.state === "loading") {
      pending += 1;
      continue;
    }
    if (p.state === "no-rate" || p.state === "error") {
      needsPrice += 1;
      continue;
    }
    price += cents(p.unitPrice) * l.quantity;
    if (p.unitCost == null) withoutCost += 1;
    else cost += cents(p.unitCost) * l.quantity;
  }
  return {
    price: money(price),
    cost: money(cost),
    profit: money(price - cost),
    priceCents: price,
    costCents: cost,
    withoutCost,
    needsPrice,
    pending,
  };
}

export type LineTotals = ReturnType<typeof sumLines>;
