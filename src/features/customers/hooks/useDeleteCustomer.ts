import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomer } from "../api/customer";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomer(customerId),
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.removeQueries({ queryKey: ["customers", customerId] });
    },
  });
}
