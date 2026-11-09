import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBooking } from "../api/booking";

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => deleteBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.removeQueries({ queryKey: ["bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
