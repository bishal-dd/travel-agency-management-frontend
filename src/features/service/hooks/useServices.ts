import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getServices } from "../api/service";
import { GetServicesParams } from "../types/service";

export function useServices(params: GetServicesParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["services", params],
      queryFn: () => getServices(params),
      placeholderData: keepPreviousData,
    });

  return {
    services: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
