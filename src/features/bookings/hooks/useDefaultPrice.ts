import { useQuery } from "@tanstack/react-query";
import { getDefaultPrice } from "../api/booking";
import type { DefaultPriceParams } from "../types/booking";

/** What an item would cost from its rate, in the booking's currency. */
export function useDefaultPrice(params: DefaultPriceParams | null) {
  return useQuery({
    queryKey: ["booking-default-price", params],
    queryFn: () => getDefaultPrice(params!),
    enabled: !!params,
    staleTime: 30_000,
    select: (response) => response.data,
  });
}
