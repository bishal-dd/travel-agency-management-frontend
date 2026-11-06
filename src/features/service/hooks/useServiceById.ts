import { useQuery } from "@tanstack/react-query";
import { getServiceById } from "../api/service";

export function useServiceById(serviceId: string) {
  return useQuery({
    queryKey: ["services", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId,
    select: (response) => response.data,
  });
}
