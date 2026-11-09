import { useQuery } from "@tanstack/react-query";
import { getCustomerById } from "../api/customer";

export function useCustomerById(customerId: string) {
  return useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
    select: (response) => response.data,
  });
}
