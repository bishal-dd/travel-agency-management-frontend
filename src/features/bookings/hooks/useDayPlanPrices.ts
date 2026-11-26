import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getDefaultPrice } from "../api/booking";
import {
  DraftLine,
  LinePrice,
  previewParams,
  priceLine,
} from "../ui/dayPlanState";

/**
 * Prices every line on every day: saved lines show their saved price,
 * new or changed ones are looked up from their rates (cached and shared
 * with useDefaultPrice). Returns line key → price.
 *
 * Each distinct rate is asked for once, even if many lines use it (the same
 * guide or vehicle every day), then shared with all those lines.
 */
export function useDayPlanPrices(
  bookingId: string,
  days: { lines: DraftLine[] }[],
) {
  const lines = useMemo(() => days.flatMap((d) => d.lines), [days]);
  const params = lines.map((l) => previewParams(l, bookingId));

  // One query per distinct lookup; lines with nothing to look up get none.
  const unique = new Map<string, NonNullable<(typeof params)[number]>>();
  const lookupOf = params.map((p) => {
    if (!p) return null;
    const id = JSON.stringify(p);
    if (!unique.has(id)) unique.set(id, p);
    return id;
  });
  const ids = [...unique.keys()];

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["booking-default-price", unique.get(id)],
      queryFn: () => getDefaultPrice(unique.get(id)!),
      staleTime: 30_000,
      select: (response: Awaited<ReturnType<typeof getDefaultPrice>>) =>
        response.data,
    })),
  });
  const resultOf = new Map(ids.map((id, i) => [id, results[i]!]));

  const prices = new Map<string, LinePrice>();
  lines.forEach((l, i) => {
    const id = lookupOf[i];
    const r = id ? resultOf.get(id) : undefined;
    prices.set(
      l.key,
      priceLine(
        l,
        r
          ? { data: r.data, isLoading: r.isLoading, isError: r.isError }
          : undefined,
      ),
    );
  });
  return prices;
}
