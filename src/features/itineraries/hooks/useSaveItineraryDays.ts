import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveItineraryDays } from "../api/itinerary";
import type { ItineraryDayInput } from "../types/itinerary";

interface SaveItineraryDaysVariables {
  itineraryId: string;
  days: ItineraryDayInput[];
}

export function useSaveItineraryDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, days }: SaveItineraryDaysVariables) =>
      saveItineraryDays(itineraryId, days),
    onSuccess: (response, { itineraryId }) => {
      // The PUT returns the full itinerary, so update the detail cache directly…
      queryClient.setQueryData(["itineraries", itineraryId], response);
      // …and refresh the lists (day counts changed), but not the detail we just set.
      queryClient.invalidateQueries({
        queryKey: ["itineraries"],
        predicate: (query) => query.queryKey[1] !== itineraryId,
      });
    },
  });
}
