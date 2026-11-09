import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "../api/service";
import { CreateServiceInput } from "../types/service";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}
