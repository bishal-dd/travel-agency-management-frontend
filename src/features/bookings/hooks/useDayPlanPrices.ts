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
 */
export function useDayPlanPrices(
  bookingId: string,
  days: { lines: DraftLine[] }[],
) {
  const lines = useMemo(() => days.flatMap((d) => d.lines), [days]);
  const params = lines.map((l) => previewParams(l, bookingId));

  const results = useQueries({
    queries: params.map((p) => ({
      queryKey: ["booking-default-price", p],
      queryFn: () => getDefaultPrice(p!),
      enabled: !!p,
      staleTime: 30_000,
      select: (response: Awaited<ReturnType<typeof getDefaultPrice>>) =>
        response.data,
    })),
  });

  const prices = new Map<string, LinePrice>();
  lines.forEach((l, i) => {
    const r = results[i]!;
    prices.set(
      l.key,
      priceLine(
        l,
        params[i] ? { data: r.data, isLoading: r.isLoading } : undefined,
      ),
    );
  });
  return prices;
}
