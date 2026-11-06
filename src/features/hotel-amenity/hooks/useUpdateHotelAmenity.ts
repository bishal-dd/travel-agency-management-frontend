import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateHotelAmenity } from "../api/updateHotelAmenity";
import {
  UpdateHotelAmenityResponse,
  UpdateHotelAmenityPayload,
} from "../types/hotel-amenity";

export function useUpdateHotelAmenity() {
  const queryClient = useQueryClient();

  const {
    mutate: update,
    data,
    isPending,
    error,
    reset,
  } = useMutation<
    UpdateHotelAmenityResponse,
    Error,
    {
      amenityId: string;
      hotelId: string;
      data: UpdateHotelAmenityPayload;
    }
  >({
    mutationFn: ({ amenityId, data }) => updateHotelAmenity(amenityId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hotel-amenities", variables.hotelId],
      });
    },
  });

  return {
    updateHotelAmenity: update,
    data,
    isPending,
    error,
    reset,
  };
}
