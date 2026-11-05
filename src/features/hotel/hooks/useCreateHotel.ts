import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHotel } from "../api/createHotel";
import { CreateHotelResponse, CreateHotelPayload } from "../types/hotel";

export function useCreateHotel() {
  const queryClient = useQueryClient();

  const {
    mutate: create,
    data,
    isPending,
    error,
  } = useMutation<CreateHotelResponse, Error, CreateHotelPayload>({
    mutationFn: (data) => createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hotels"],
      });
    },
  });

  return {
    createHotel: create,
    data,
    isPending,
    error,
  };
}
