import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuide } from "../api/guide";
import type { UpdateGuideInput } from "../types/guide";

interface UpdateGuideVariables {
  guideId: string;
  data: UpdateGuideInput;
}

export function useUpdateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guideId, data }: UpdateGuideVariables) =>
      updateGuide(guideId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guides"],
      });

      queryClient.invalidateQueries({
        queryKey: ["guides", variables.guideId],
      });
    },
  });
}
