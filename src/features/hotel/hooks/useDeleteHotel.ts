import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHotel } from "../api/deleteHotel";
import { DeleteHotelResponse } from "../types/hotel";

export function useDeleteHotel() {
  const queryClient = useQueryClient();

  const {
    mutate: remove,
    data,
    isPending,
    error,
    reset,
  } = useMutation<DeleteHotelResponse, Error, string>({
    mutationFn: (hotelId) => deleteHotel(hotelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hotels"],
      });
    },
  });

  return {
    deleteHotel: remove,
    data,
    isPending,
    error,
    reset,
  };
}
