"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

/**
 * Dashboard shell data and actions: Better Auth session, agency switching and
 * sign-out. Team members and invitations live in features/team.
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

      router.refresh();
    } catch {
      setSwitchError("Unable to connect to the server.");
    } finally {
      setIsSwitching(false);
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
    handleSignOut,
  };
}

export type AgencyDashboard = ReturnType<typeof useAgencyDashboard>;
