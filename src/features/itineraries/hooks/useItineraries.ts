import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getItineraries } from "../api/itinerary";
import type { GetItinerariesParams } from "../types/itinerary";

export function useItineraries(params: GetItinerariesParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["itineraries", params],
    queryFn: () => getItineraries(params),
    placeholderData: keepPreviousData,
  });

  return {
    itineraries: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
