import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGuide } from "../api/guide";

export function useDeleteGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guideId: string) => deleteGuide(guideId),

    onSuccess: (_, guideId) => {
      queryClient.invalidateQueries({
        queryKey: ["guides"],
      });

      queryClient.removeQueries({
        queryKey: ["guides", guideId],
      });
    },
  });
}
