"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardProvider } from "./DashboardContext";
import { useAgencyDashboard } from "./useAgencyDashboard";
import { CenteredState, Loading } from "./parts";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const d = useAgencyDashboard();
  const isReady = !d.isSessionPending && !d.sessionError && !!d.session;

  return (
    <DashboardProvider value={d}>
      {d.isSessionPending ? (
        <CenteredState>
          <div className="flex justify-center">
            <Loading>Loading session...</Loading>
          </div>
        </CenteredState>
      ) : (
        !isReady && (
          <CenteredState>
            <p className="font-display text-2xl font-medium">
              You are not signed in.
            </p>

            <Link
              href="/sign-in"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep"
            >
              Sign in
            </Link>
          </CenteredState>
        )
      )}

      <div
        hidden={!isReady}
        className="min-h-dvh bg-mist lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]"
      >
        {isReady && <DashboardSidebar d={d} />}

        <main className="min-w-0 p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </DashboardProvider>
  );
}
