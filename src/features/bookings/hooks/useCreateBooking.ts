import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "../api/booking";
import type { CreateBookingInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingInput) => createBooking(data),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
