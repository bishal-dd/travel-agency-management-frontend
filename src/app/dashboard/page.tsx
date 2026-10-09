"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

type AgencyInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
};

export default function DashboardPage() {
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
        role: "member",
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

      router.replace("/signin");
      router.refresh();
    } catch {
      setSwitchError("Unable to sign out. Please try again.");
    }
  }

  // Loading state
  if (isSessionPending) {
    return <main className="p-8">Loading session...</main>;
  }

  // Authentication check
  if (sessionError || !session) {
    return (
      <main className="space-y-4 p-8">
        <p>You are not signed in.</p>
        <a href="/signin" className="underline">
          Sign in
        </a>
      </main>
    );
  }

  const isLoadingOrganizations =
    isActiveOrganizationPending || areOrganizationsPending;

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending",
  );

  return (
    <main className="space-y-6 p-8">
      {/* User information */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
        <p>Email: {session.user.email}</p>
      </section>

      {/* Agency selector */}
      <section className="max-w-md space-y-3 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Your travel agency</h2>

        {isLoadingOrganizations ? (
          <p>Loading agencies...</p>
        ) : organizations?.length ? (
          <>
            <label htmlFor="agency" className="block text-sm font-medium">
              Active agency
            </label>

            <select
              id="agency"
              value={activeOrganization?.id ?? ""}
              onChange={(event) => handleOrganizationChange(event.target.value)}
              disabled={isSwitching}
              className="w-full rounded-md border bg-transparent p-2"
            >
              {!activeOrganization && (
                <option value="">Select an agency</option>
              )}

              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>

            {isSwitching && <p>Switching agency...</p>}

            {switchError && (
              <p role="alert" className="text-sm text-red-600">
                {switchError}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <p>You don't belong to any agencies yet.</p>
            <a href="/onboarding" className="underline">
              Create an agency
            </a>
          </div>
        )}
      </section>

      {/* Employee invitation form */}
      {activeOrganization && (
        <section className="max-w-md space-y-4 rounded-lg border p-4">
          <div>
            <h2 className="text-lg font-semibold">Invite an employee</h2>
            <p className="text-sm text-gray-500">
              Invite someone to join {activeOrganization.name}.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="inviteEmail" className="text-sm font-medium">
                Employee email
              </label>

              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="employee@example.com"
                autoComplete="email"
                required
                className="w-full rounded-md border p-2"
              />
            </div>

            {inviteError && (
              <p role="alert" className="text-sm text-red-600">
                {inviteError}
              </p>
            )}

            {inviteSuccess && (
              <p role="status" className="text-sm text-green-700">
                {inviteSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {isInviting ? "Sending invitation..." : "Invite employee"}
            </button>
          </form>
        </section>
      )}

      {/* Pending invitations */}
      {activeOrganization && (
        <section className="max-w-md space-y-4 rounded-lg border p-4">
          <div>
            <h2 className="text-lg font-semibold">Agency invitations</h2>
            <p className="text-sm text-gray-500">
              Invitations for {activeOrganization.name}
            </p>
          </div>

          {isLoadingInvitations ? (
            <p className="text-sm text-gray-500">Loading invitations...</p>
          ) : invitationError ? (
            <div className="space-y-2">
              <p role="alert" className="text-sm text-red-600">
                {invitationError}
              </p>
              <button
                type="button"
                onClick={() => setInvitationRefreshKey((key) => key + 1)}
                className="text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <p className="text-sm text-gray-500">No pending invitations.</p>
          ) : (
            <ul className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="space-y-1 rounded-md border p-3"
                >
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-gray-500">
                    Role: {invitation.role}
                  </p>
                  <p className="text-sm text-amber-700">Pending</p>
                  <p className="text-xs text-gray-500">
                    Expires:{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-md border px-4 py-2"
      >
        Sign out
      </button>
    </main>
  );
}
