import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBookingTravellers } from "../api/booking";
import type { TravellerInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

interface SaveTravellersVariables {
  bookingId: string;
  travellers: TravellerInput[];
}

export function useSaveBookingTravellers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, travellers }: SaveTravellersVariables) =>
      saveBookingTravellers(bookingId, travellers),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
