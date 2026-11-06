import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService } from "../api/service";

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),

    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      queryClient.removeQueries({
        queryKey: ["services", serviceId],
      });
    },
  });
}
