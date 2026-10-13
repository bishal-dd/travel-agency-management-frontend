import { Mail } from "lucide-react";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { Card, ErrorText, Loading } from "./parts";

type Props = Pick<
  AgencyDashboard,
  "pendingInvitations" | "isLoadingInvitations" | "invitationError" | "retryInvitations"
> & { agencyName: string };

export function InvitationList({
  agencyName,
  pendingInvitations,
  isLoadingInvitations,
  invitationError,
  retryInvitations,
}: Props) {
  return (
    <Card title="Agency invitations" description={`Invitations for ${agencyName}`}>
      {isLoadingInvitations ? (
        <Loading>Loading invitations...</Loading>
      ) : invitationError ? (
        <div className="space-y-3">
          <ErrorText>{invitationError}</ErrorText>
          <button
            type="button"
            onClick={retryInvitations}
            className="text-sm font-semibold text-lagoon hover:text-lagoon-deep"
          >
            Try again
          </button>
        </div>
      ) : pendingInvitations.length === 0 ? (
        <p className="rounded-2xl bg-mist px-4 py-6 text-center text-sm text-ink-soft">
          No pending invitations.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {pendingInvitations.map((invitation) => (
            <li key={invitation.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lagoon-tint text-lagoon-deep">
                <Mail size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{invitation.email}</p>
                <p className="text-xs text-ink-soft">
                  <span className="capitalize">Role: {invitation.role}</span>
                  <span aria-hidden="true"> · </span>
                  Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-marigold-tint px-2.5 py-1 text-xs font-semibold text-ink">
                Pending
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
