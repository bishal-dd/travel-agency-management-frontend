"use client";

import { InviteForm } from "./InviteForm";
import { InvitationList } from "./InvitationList";
import { ErrorText } from "./parts";
import { useDashboardContext } from "./DashboardContext";

export function Dashboard() {
  const d = useDashboardContext();
  const user = d.session?.user;

  if (!user) return null;

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-lagoon">
            Agency overview
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-ink-soft">
            Manage your agency team and invitations.
          </p>
        </div>
      </div>

      {d.switchError && (
        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-red-200">
          <ErrorText>{d.switchError}</ErrorText>
        </div>
      )}

      {d.activeOrganization && (
        <div className="mt-8 grid items-start gap-5 xl:grid-cols-2">
          <InviteForm agencyName={d.activeOrganization.name} {...d} />

          <InvitationList agencyName={d.activeOrganization.name} {...d} />
        </div>
      )}
    </section>
  );
}
