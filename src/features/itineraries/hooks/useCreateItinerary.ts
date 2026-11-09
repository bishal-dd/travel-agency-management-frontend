import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItinerary } from "../api/itinerary";
import type { CreateItineraryInput } from "../types/itinerary";

export function useCreateItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItineraryInput) => createItinerary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}
