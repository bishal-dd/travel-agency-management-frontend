import type { AgencyDashboard, InviteRole } from "./useAgencyDashboard";
import { Card, ErrorText, SuccessText, controlClass } from "./parts";

type Props = Pick<
  AgencyDashboard,
  | "inviteEmail"
  | "setInviteEmail"
  | "inviteRole"
  | "setInviteRole"
  | "isInviting"
  | "inviteError"
  | "inviteSuccess"
  | "handleInvite"
> & { agencyName: string };

export function InviteForm({
  agencyName,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  isInviting,
  inviteError,
  inviteSuccess,
  handleInvite,
}: Props) {
  return (
    <Card title="Invite an employee" description={`Invite someone to join ${agencyName}.`}>
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem] lg:grid-cols-1 xl:grid-cols-[1fr_9rem]">
          <div>
            <label htmlFor="inviteEmail" className="text-sm font-semibold">
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
              className={`${controlClass} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="inviteRole" className="text-sm font-semibold">
              Employee role
            </label>
            <select
              id="inviteRole"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as InviteRole)}
              disabled={isInviting}
              className={`${controlClass} mt-2`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {inviteError && <ErrorText>{inviteError}</ErrorText>}
        {inviteSuccess && <SuccessText>{inviteSuccess}</SuccessText>}

        <button
          type="submit"
          disabled={isInviting || !inviteEmail.trim()}
          className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-lagoon-deep disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-ink"
        >
          {isInviting ? "Sending invitation..." : "Invite employee"}
        </button>
      </form>
    </Card>
  );
}
