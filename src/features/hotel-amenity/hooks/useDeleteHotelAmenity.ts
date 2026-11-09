import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteHotelAmenity } from "../api/deleteHotelAmenity";
import { DeleteHotelAmenityResponse } from "../types/hotel-amenity";

export function useDeleteHotelAmenity() {
  const queryClient = useQueryClient();

  const {
    mutate: remove,
    data,
    isPending,
    error,
    reset,
  } = useMutation<
    DeleteHotelAmenityResponse,
    Error,
    { amenityId: string; hotelId: string }
  >({
    mutationFn: ({ amenityId }) => deleteHotelAmenity(amenityId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hotel-amenities", variables.hotelId],
      });
    },
  });

  return {
    deleteHotelAmenity: remove,
    data,
    isPending,
    error,
    reset,
  };
}
