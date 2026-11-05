import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createHotelAmenity } from "../api/createHotelAmenity";
import {
  CreateHotelAmenityResponse,
  CreateHotelAmenityPayload,
} from "../types/hotel-amenity";

export function useCreateHotelAmenity() {
  const queryClient = useQueryClient();

  const {
    mutate: create,
    data,
    isPending,
    error,
    reset,
  } = useMutation<CreateHotelAmenityResponse, Error, CreateHotelAmenityPayload>(
    {
      mutationFn: (data) => createHotelAmenity(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["hotel-amenities", variables.hotelId],
        });
      },
    },
  );

  return {
    createHotelAmenity: create,
    data,
    isPending,
    error,
    reset,
  };
}
