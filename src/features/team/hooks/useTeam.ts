import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { ROLE_ORDER } from "../roles";
import type { AssignableRole, TeamInvitation, TeamMember } from "../types/team";

type AuthResult<T> = {
  data: T | null;
  error: { message?: string; status?: number } | null;
};

/** Better Auth returns { data, error }; turn an error into a thrown Error for React Query. */
async function unwrap<T>(
  promise: Promise<AuthResult<T>>,
  fallback: string,
): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message || fallback);
  return data as T;
}

/**
 * The active agency's members and invitations, plus who "I" am in it.
 * One request: Better Auth's full organization includes both.
 */
export function useTeam() {
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const organizationId = activeOrganization?.id;

  const query = useQuery({
    queryKey: ["team", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const org = await unwrap(
        authClient.organization.getFullOrganization({
          query: { organizationId: organizationId! },
        }) as Promise<
          AuthResult<{
            name: string;
            members?: TeamMember[];
            invitations?: TeamInvitation[];
          }>
        >,
        "Couldn't load the team.",
      );
      return org;
    },
  });

  const members = [...(query.data?.members ?? [])].sort(
    (a, b) =>
      ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
      a.user.name.localeCompare(b.user.name),
  );
  const invitations = (query.data?.invitations ?? []).filter(
    (i) => i.status === "pending",
  );
  const me = members.find((m) => m.userId === session?.user.id);

  return {
    organizationId,
    agencyName: query.data?.name ?? activeOrganization?.name ?? "",
    members,
    invitations,
    me,
    myRole: me?.role,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

function useTeamMutation<V>(
  organizationId: string | undefined,
  run: (vars: V) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team", organizationId] }),
  });
}

export function useInviteMember(organizationId?: string) {
  return useTeamMutation(
    organizationId,
    (v: { email: string; role: AssignableRole; resend?: boolean }) =>
      unwrap(
        authClient.organization.inviteMember({
          email: v.email,
          role: v.role,
          organizationId,
          resend: v.resend,
        }),
        "Couldn't send the invitation.",
      ),
  );
}

export function useCancelInvitation(organizationId?: string) {
  return useTeamMutation(organizationId, (invitationId: string) =>
    unwrap(
      authClient.organization.cancelInvitation({ invitationId }),
      "Couldn't cancel the invitation.",
    ),
  );
}

export function useUpdateMemberRole(organizationId?: string) {
  return useTeamMutation(
    organizationId,
    (v: { memberId: string; role: AssignableRole }) =>
      unwrap(
        authClient.organization.updateMemberRole({
          memberId: v.memberId,
          role: v.role,
          organizationId,
        }),
        "Couldn't change the role.",
      ),
  );
}

export function useRemoveMember(organizationId?: string) {
  return useTeamMutation(organizationId, (memberId: string) =>
    unwrap(
      authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId,
      }),
      "Couldn't remove this person.",
    ),
  );
}
