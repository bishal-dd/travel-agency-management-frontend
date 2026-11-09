import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDrivers, type GetDriversParams } from "../api/driver";

export function useDrivers(params: GetDriversParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["drivers", params],
      queryFn: () => getDrivers(params),
      placeholderData: keepPreviousData,
    });

  return {
    drivers: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
