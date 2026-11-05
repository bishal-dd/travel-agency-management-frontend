import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHotels } from "../api/getHotels";
import type { GetHotelsParams } from "../api/getHotels";

export function useHotels(params: GetHotelsParams = {}) {
  const {
    data,
    isLoading,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hotels", params],
    queryFn: () => getHotels(params),
    staleTime: 0,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  return {
    hotels: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
