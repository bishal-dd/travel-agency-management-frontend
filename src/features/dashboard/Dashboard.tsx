"use client";

import { ErrorText } from "./parts";
import { useDashboardContext } from "./DashboardContext";
import { OverviewSections } from "../overview/OverviewPage";

/** Agency overview: greeting, then the day at a glance. */
export function Dashboard() {
  const d = useDashboardContext();
  const user = d.session?.user;

  if (!user) return null;

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-lagoon">
          Agency overview
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        {d.activeOrganization && (
          <p className="mt-1 text-ink-soft">{d.activeOrganization.name}</p>
        )}
      </div>

      {d.switchError && (
        <div className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-red-200">
          <ErrorText>{d.switchError}</ErrorText>
        </div>
      )}

      <OverviewSections />
    </section>
  );
}
