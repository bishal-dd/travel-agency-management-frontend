import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../api/booking";

export function useBookingById(bookingId: string) {
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
    select: (response) => response.data,
  });
}
