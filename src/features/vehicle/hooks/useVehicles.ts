import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getVehicles, type GetVehiclesParams } from "../api/vehicle";

export function useVehicles(params: GetVehiclesParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["vehicles", params],
      queryFn: () => getVehicles(params),
      placeholderData: keepPreviousData,
    });

  return {
    vehicles: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
