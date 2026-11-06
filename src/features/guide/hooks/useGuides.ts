import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getGuides, type GetGuidesParams } from "../api/guide";

export function useGuides(params: GetGuidesParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["guides", params],
      queryFn: () => getGuides(params),
      placeholderData: keepPreviousData,
    });

  return {
    guides: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
