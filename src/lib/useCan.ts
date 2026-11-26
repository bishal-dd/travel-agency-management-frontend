"use client";

import { authClient } from "@/src/lib/auth-client";
import { organizationRoles, type PermissionInput } from "@/src/lib/permissions";

type RoleName = keyof typeof organizationRoles;

/**
 * Can someone with this role do all of `needs`? Uses the same roles as the
 * backend (permissions.ts), checked locally: no request.
 * A member can hold several roles ("admin,accountant"): any one is enough.
 */
export function roleCan(
  role: string | null | undefined,
  needs: PermissionInput | undefined,
) {
  if (!needs || Object.keys(needs).length === 0) return true;
  if (!role) return false;
  return role
    .split(",")
    .map((r) => r.trim())
    .some((r) => {
      const def = organizationRoles[r as RoleName];
      if (!def) return false;
      // Better Auth's role check: every listed action must be allowed.
      return def.authorize(needs as Parameters<typeof def.authorize>[0])
        .success;
    });
}

/** The signed-in user's role in the active agency, from the members Better Auth already loaded. */
export function useMyRole() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: org, isPending: orgPending } =
    authClient.useActiveOrganization();
  const members = (
    org as { members?: { userId: string; role: string }[] } | null
  )?.members;
  const role =
    members?.find((m) => m.userId === session?.user.id)?.role ?? null;
  return {
    role,
    isPending: sessionPending || orgPending || (!!org && !members),
  };
}

/**
 * const { can, ready } = useCan();
 * can({ payment: ["read"] })
 *
 * Hides what the backend would refuse anyway (the backend still checks every
 * request). Until the role is known, `can` returns false for anything gated.
 */
export function useCan() {
  const { role, isPending } = useMyRole();
  return {
    role,
    ready: !isPending,
    can: (needs?: PermissionInput) => roleCan(role, needs),
  };
}
