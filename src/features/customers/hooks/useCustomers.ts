import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCustomers } from "../api/customer";
import type { GetCustomersParams } from "../types/customer";

export function useCustomers(params: GetCustomersParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["customers", params],
      queryFn: () => getCustomers(params),
      placeholderData: keepPreviousData,
    });

  return {
    customers: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
