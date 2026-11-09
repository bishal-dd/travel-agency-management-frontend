import { useQuery } from "@tanstack/react-query";
import { getLastPrice } from "../api/booking";
import type { LastPriceParams } from "../types/booking";

/** The last price this agency used for a room / hotel / vehicle / guide / service. */
export function useLastPrice(params: LastPriceParams | null) {
  return useQuery({
    queryKey: ["booking-last-price", params],
    queryFn: () => getLastPrice(params!),
    enabled: !!params,
    staleTime: 60_000,
    select: (response) => response.data,
  });
}
