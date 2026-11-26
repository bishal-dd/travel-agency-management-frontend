"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorText, Loading } from "./parts";
import { useDashboardContext } from "./DashboardContext";
import { OverviewSections } from "../overview/OverviewPage";
import { useCan } from "@/src/lib/useCan";

/** Guides have no agency overview: their home is "My trips". */
function useIsGuideOnly() {
  const { can, ready } = useCan();
  return {
    ready,
    guideOnly:
      ready && can({ myTrips: ["read"] }) && !can({ booking: ["read"] }),
  };
}

/** Agency overview: greeting, then the day at a glance. */
export function Dashboard() {
  const d = useDashboardContext();
  const router = useRouter();
  const { ready, guideOnly } = useIsGuideOnly();
  const user = d.session?.user;

  useEffect(() => {
    if (guideOnly) router.replace("/dashboard/my-trips");
  }, [guideOnly, router]);

  if (!user) return null;
  if (!ready || guideOnly) return <Loading>Loading…</Loading>;

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
