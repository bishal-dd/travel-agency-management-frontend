import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBookingDays } from "../api/booking";
import type { BookingDayInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

interface SaveDaysVariables {
  bookingId: string;
  days: BookingDayInput[];
}

export function useSaveBookingDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, days }: SaveDaysVariables) => saveBookingDays(bookingId, days),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
