import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recalculateBookingFees } from "../api/booking";
import { storeBooking } from "./bookingCache";

/** Re-lock a confirmed booking's fees from today's travellers, dates and rules. */
export function useRecalculateFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => recalculateBookingFees(bookingId),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
