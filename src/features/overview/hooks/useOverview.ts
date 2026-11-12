import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { getOverview } from "../api/overview";

/** The agency overview. Keyed by agency so switching agency loads the right one. */
export function useOverview() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return useQuery({
    queryKey: ["overview", activeOrganization?.id],
    queryFn: getOverview,
    select: (r) => r.data,
    enabled: !!activeOrganization?.id,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
