import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHotel } from "../api/updateHotel";
import { UpdateHotelResponse, UpdateHotelPayload } from "../types/hotel";

export function useUpdateHotel() {
  const queryClient = useQueryClient();

  const {
    mutate: update,
    data,
    isPending,
    error,
  } = useMutation<
    UpdateHotelResponse,
    Error,
    { hotelId: string; data: UpdateHotelPayload }
  >({
    mutationFn: ({ hotelId, data }) => updateHotel(hotelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hotels"],
      });
    },
  });

  return {
    updateHotel: update,
    data,
    isPending,
    error,
  };
}
