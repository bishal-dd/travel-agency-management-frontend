import { useQuery } from "@tanstack/react-query";
import { getGuideById } from "../api/guide";

export function useGuideById(guideId: string) {
  return useQuery({
    queryKey: ["guides", guideId],
    queryFn: () => getGuideById(guideId),
    enabled: !!guideId,
    select: (response) => response.data,
  });
}
