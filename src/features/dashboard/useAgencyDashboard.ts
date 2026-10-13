"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

export type AgencyInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
};

export type InviteRole = "admin" | "member";

/**
 * All dashboard data and actions: Better Auth session, agency switching,
 * employee invitations, the pending invitation list and sign-out.
 * The logic is unchanged from the original dashboard page; only the UI moved.
 */
export function useAgencyDashboard() {
  const router = useRouter();

  // Authentication and organization data
  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession();

  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    authClient.useActiveOrganization();

  const { data: organizations, isPending: areOrganizationsPending } =
    authClient.useListOrganizations();

  // Agency switching state
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");

  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");

  // Pending invitation list state
  const [invitations, setInvitations] = useState<AgencyInvitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [invitationRefreshKey, setInvitationRefreshKey] = useState(0);

  // Switch the active agency
  async function handleOrganizationChange(organizationId: string) {
    if (!organizationId || organizationId === activeOrganization?.id) {
      return;
    }

    setSwitchError("");
    setIsSwitching(true);

    try {
      const { error } = await authClient.organization.setActive({
        organizationId,
      });

      if (error) {
        setSwitchError(error.message ?? "Failed to switch agency.");
        return;
      }

      setInvitationRefreshKey((key) => key + 1);
      router.refresh();
    } catch {
      setSwitchError("Unable to connect to the server.");
    } finally {
      setIsSwitching(false);
    }
  }

  // Load invitations for the active agency
  const loadInvitations = useCallback(async () => {
    const organizationId = activeOrganization?.id;

    if (!organizationId) {
      setInvitations([]);
      setInvitationError("");
      setIsLoadingInvitations(false);
      return;
    }

    setIsLoadingInvitations(true);
    setInvitationError("");

    try {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId },
      });

      if (error) {
        setInvitationError(error.message ?? "Failed to load invitations.");
        return;
      }

      setInvitations((data ?? []) as AgencyInvitation[]);
    } catch {
      setInvitationError("Unable to load invitations. Please try again.");
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations, invitationRefreshKey]);

  // Invite an employee to the active agency
  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = inviteEmail.trim();

    if (!email || !activeOrganization || isInviting) {
      return;
    }

    setInviteError("");
    setInviteSuccess("");
    setIsInviting(true);

    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        role: inviteRole,
      });

      if (error) {
        setInviteError(error.message ?? "Failed to create invitation.");
        return;
      }

      setInviteSuccess(`Invitation created for ${email}.`);
      setInviteEmail("");

      // Reload the pending invitation list
      setInvitationRefreshKey((key) => key + 1);
    } catch {
      setInviteError("Unable to connect to the server.");
    } finally {
      setIsInviting(false);
    }
  }

  // Sign out the current user
  async function handleSignOut() {
    setSwitchError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setSwitchError("Unable to sign out. Please try again.");
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSwitchError("Unable to sign out. Please try again.");
    }
  }

  return {
    session,
    isSessionPending,
    sessionError,
    activeOrganization,
    organizations,
    isLoadingOrganizations:
      isActiveOrganizationPending || areOrganizationsPending,
    isSwitching,
    switchError,
    handleOrganizationChange,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    isInviting,
    inviteError,
    inviteSuccess,
    handleInvite,
    pendingInvitations: invitations.filter(
      (invitation) => invitation.status === "pending",
    ),
    isLoadingInvitations,
    invitationError,
    retryInvitations: () => setInvitationRefreshKey((key) => key + 1),
    handleSignOut,
  };
}

export type AgencyDashboard = ReturnType<typeof useAgencyDashboard>;
