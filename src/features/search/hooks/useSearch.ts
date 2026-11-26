import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { searchEverything } from "../api/search";

/** Results for the header search (2+ characters). */
export function useSearch(q: string) {
  const { data: org } = authClient.useActiveOrganization();
  const term = q.trim();
  return useQuery({
    queryKey: ["search", org?.id, term.toLowerCase()],
    queryFn: ({ signal }) => searchEverything(term, signal),
    enabled: !!org?.id && term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: false,
  });
}
