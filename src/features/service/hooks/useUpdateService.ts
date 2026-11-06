import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateService } from "../api/service";
import { UpdateServiceInput } from "../types/service";

interface UpdateServiceVariables {
  serviceId: string;
  data: UpdateServiceInput;
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: UpdateServiceVariables) =>
      updateService(serviceId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["services", variables.serviceId],
      });
    },
  });
}
