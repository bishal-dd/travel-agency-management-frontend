import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBookingDays } from "../api/booking";
import type { BookingDayInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

interface SaveDaysVariables {
  bookingId: string;
  days: BookingDayInput[];
  /** Re-price every line from today's rates (special prices are kept). */
  refreshRates?: boolean;
}

export function useSaveBookingDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, days, refreshRates }: SaveDaysVariables) =>
      saveBookingDays(bookingId, days, refreshRates),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
