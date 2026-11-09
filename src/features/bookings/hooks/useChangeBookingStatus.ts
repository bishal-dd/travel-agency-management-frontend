import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeBookingStatus } from "../api/booking";
import type { BookingStatus } from "../types/booking";
import { storeBooking } from "./bookingCache";

interface ChangeStatusVariables {
  bookingId: string;
  status: BookingStatus;
}

export function useChangeBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }: ChangeStatusVariables) =>
      changeBookingStatus(bookingId, status),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
