import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGuide } from "../api/guide";
import type { CreateGuideInput } from "../types/guide";

export function useCreateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGuideInput) => createGuide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["guides"],
      });
    },
  });
}
