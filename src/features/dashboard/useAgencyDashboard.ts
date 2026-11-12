"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";

/** The agency this browser used last, so people in several agencies return to it. */
const LAST_AGENCY_KEY = "hmt:lastAgency";

function readLastAgency() {
  try {
    return localStorage.getItem(LAST_AGENCY_KEY);
  } catch {
    return null; // private mode / storage blocked
  }
}

function rememberAgency(organizationId: string) {
  try {
    localStorage.setItem(LAST_AGENCY_KEY, organizationId);
  } catch {
    // not critical
  }
}

/**
 * Dashboard shell data and actions: Better Auth session, agency switching and
 * sign-out. Team members and invitations live in features/team.
 */
export function useAgencyDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

      rememberAgency(organizationId);
      // Drop the previous agency's data and reload what's on screen.
      await queryClient.resetQueries();
      router.refresh();
    } catch {
      setSwitchError("Unable to connect to the server.");
    } finally {
      setIsSwitching(false);
    }
  }

  // Keep the last-used agency up to date (e.g. after accepting an invitation).
  useEffect(() => {
    if (activeOrganization?.id) rememberAgency(activeOrganization.id);
  }, [activeOrganization?.id]);

  // Signed in but no active agency (older session, or the user was removed
  // from it): pick the last-used one, else the first. Tried once per session.
  const autoPicked = useRef<string | null>(null);
  useEffect(() => {
    if (
      isSessionPending ||
      isActiveOrganizationPending ||
      areOrganizationsPending
    )
      return;
    if (!session || activeOrganization || isSwitching || !organizations?.length)
      return;
    if (autoPicked.current === session.session.id) return;
    autoPicked.current = session.session.id;

    const last = readLastAgency();
    const target = organizations.find((o) => o.id === last) ?? organizations[0];
    if (target) void handleOrganizationChange(target.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session,
    activeOrganization,
    organizations,
    isSwitching,
    isSessionPending,
    isActiveOrganizationPending,
    areOrganizationsPending,
  ]);

  // Sign out the current user
  async function handleSignOut() {
    setSwitchError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setSwitchError("Unable to sign out. Please try again.");
        return;
      }

      // Don't leave this user's data in memory for whoever signs in next.
      queryClient.clear();
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
