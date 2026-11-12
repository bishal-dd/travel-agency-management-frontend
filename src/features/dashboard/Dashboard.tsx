"use client";

import { ErrorText } from "./parts";
import { useDashboardContext } from "./DashboardContext";

/**
 * Agency overview. Team invitations moved to the Team page; this becomes the
 * daily dashboard (action needed, upcoming trips, this month, activity).
 */
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
          {d.activeOrganization && (
            <p className="mt-2 text-ink-soft">{d.activeOrganization.name}</p>
          )}
        </div>
      </div>

      {d.switchError && (
        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-red-200">
          <ErrorText>{d.switchError}</ErrorText>
        </div>
      )}
    </section>
  );
}
