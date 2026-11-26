"use client";

import { useInviteMember, useTeam } from "../../team/hooks/useTeam";
import { canInvite, roleLabel } from "../../team/roles";

/** Can this guide sign in to HMT? Matched by email, like My trips. */
export type GuideLogin =
  | { state: "joined"; role: string; roleLabel: string }
  | { state: "invited"; role: string }
  | { state: "none" };

const norm = (email: string) => email.trim().toLowerCase();

/**
 * Who in the agency has a login (members) or a pending invitation, looked up
 * by email. Uses the Team page's data, so inviting here shows up there too.
 */
export function useGuideLogins() {
  const team = useTeam();
  const members = new Map(
    team.members.map((m) => [norm(m.user.email), m.role]),
  );
  const invited = new Map(team.invitations.map((i) => [norm(i.email), i.role]));

  function lookup(email: string | null | undefined): GuideLogin | null {
    if (!email?.trim() || team.isPending) return null;
    const key = norm(email);
    const role = members.get(key);
    if (role) return { state: "joined", role, roleLabel: roleLabel(role) };
    const inviteRole = invited.get(key);
    if (inviteRole) return { state: "invited", role: inviteRole };
    return { state: "none" };
  }

  return {
    lookup,
    /** Owners and managers can invite (the server checks the same). */
    canInvite: canInvite(team.myRole),
    organizationId: team.organizationId,
  };
}

/** Send (or resend) a Guide invitation to this email. */
export function useInviteGuide(organizationId: string | undefined) {
  const invite = useInviteMember(organizationId);
  return {
    ...invite,
    send: (email: string, resend = false) =>
      invite.mutateAsync({ email: email.trim(), role: "guide", resend }),
  };
}
