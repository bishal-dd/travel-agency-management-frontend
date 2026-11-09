import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItinerary } from "../api/itinerary";
import type { UpdateItineraryInput } from "../types/itinerary";

interface UpdateItineraryVariables {
  itineraryId: string;
  data: UpdateItineraryInput;
}

export function useUpdateItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: UpdateItineraryVariables) =>
      updateItinerary(itineraryId, data),
    onSuccess: () => {
      // Prefix match: refreshes the lists and the ["itineraries", id] detail.
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}
