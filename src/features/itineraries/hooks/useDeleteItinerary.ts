import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteItinerary } from "../api/itinerary";

export function useDeleteItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itineraryId: string) => deleteItinerary(itineraryId),
    onSuccess: (_, itineraryId) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      queryClient.removeQueries({ queryKey: ["itineraries", itineraryId] });
    },
  });
}
