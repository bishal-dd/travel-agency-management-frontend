import type { QueryClient } from "@tanstack/react-query";
import type { BookingDetailResponse } from "../types/booking";

/**
 * Every booking mutation returns the full booking. Put it straight into the
 * detail cache, then refresh the lists (but not the detail we just set).
 */
export function storeBooking(queryClient: QueryClient, response: BookingDetailResponse) {
  const id = response.data.id;
  queryClient.setQueryData(["bookings", id], response);
  queryClient.invalidateQueries({
    queryKey: ["bookings"],
    predicate: (query) => query.queryKey[1] !== id,
  });
}
