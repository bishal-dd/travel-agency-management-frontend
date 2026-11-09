import { useQuery } from "@tanstack/react-query";
import { getItineraryById } from "../api/itinerary";

export function useItineraryById(itineraryId: string) {
  return useQuery({
    queryKey: ["itineraries", itineraryId],
    queryFn: () => getItineraryById(itineraryId),
    enabled: !!itineraryId,
    select: (response) => response.data,
  });
}
