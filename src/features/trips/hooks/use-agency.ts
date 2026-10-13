"use client";

import { authClient } from "@/src/lib/auth-client";

/** Signed-in user and their active agency, which every trip belongs to. */
export function useAgency() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { data: agency, isPending: isAgencyPending } = authClient.useActiveOrganization();

  return {
    user: session?.user ?? null,
    agency: agency ?? null,
    isLoading: isSessionPending || (!!session && isAgencyPending),
  };
}
