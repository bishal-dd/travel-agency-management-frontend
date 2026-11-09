import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../api/booking";
import type { UpdateBookingInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

interface UpdateBookingVariables {
  bookingId: string;
  data: UpdateBookingInput;
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: UpdateBookingVariables) => updateBooking(bookingId, data),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
