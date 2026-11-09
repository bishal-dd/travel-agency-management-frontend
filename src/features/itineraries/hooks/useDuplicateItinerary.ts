import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateItinerary } from "../api/itinerary";

export function useDuplicateItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itineraryId: string) => duplicateItinerary(itineraryId),
    onSuccess: (response) => {
      queryClient.setQueryData(["itineraries", response.data.id], response);
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}
