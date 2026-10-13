"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, Plane } from "lucide-react";
import { ButtonLink, Logo, LogoMark, Spinner } from "@/src/components/ui";
import { cn } from "@/src/lib/cn";
import { useAgency } from "../hooks/use-agency";
import { tripRoutes } from "../passport/routes";

type Agency = { id: string; name: string };

function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <main className="contours grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-line">
        <LogoMark className="mx-auto" />
        {children}
      </div>
    </main>
  );
}

/**
 * Page frame for the trips screens. Handles loading, signed-out and
 * no-agency states, then renders `children` with the active agency.
 */
export function TripsShell({
  section,
  children,
}: {
  section: "list" | "create" | "detail";
  children: (agency: Agency) => ReactNode;
}) {
  const { user, agency, isLoading } = useAgency();

  if (isLoading) {
    return (
      <CenteredCard>
        <Spinner label="Loading..." className="mt-5" />
      </CenteredCard>
    );
  }

  if (!user) {
    return (
      <CenteredCard>
        <p className="font-display mt-5 text-2xl font-medium">
          Sign in to continue
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in to see your agency&apos;s trips.
        </p>
        <ButtonLink
          href={`${tripRoutes.signIn}?callbackURL=${encodeURIComponent(tripRoutes.list)}`}
          className="mt-6"
        >
          Go to sign in
        </ButtonLink>
      </CenteredCard>
    );
  }

  if (!agency) {
    return (
      <CenteredCard>
        <p className="font-display mt-5 text-2xl font-medium">
          No agency selected
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Trips belong to an agency. Choose one on the dashboard, or create one.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href={tripRoutes.onboarding}>Create an agency</ButtonLink>
          <ButtonLink href={tripRoutes.dashboard} variant="secondary">
            Go to dashboard
          </ButtonLink>
        </div>
      </CenteredCard>
    );
  }

  const navLink = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors",
      active
        ? "bg-ink text-white"
        : "text-ink-soft hover:bg-mist hover:text-ink",
    );

  return (
    <div className="min-h-dvh bg-mist">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo href={tripRoutes.dashboard} />
          <nav
            aria-label="Main"
            className="ml-2 hidden items-center gap-1 sm:flex"
          >
            <Link href={tripRoutes.dashboard} className={navLink(false)}>
              <Building2 size={15} aria-hidden="true" /> Dashboard
            </Link>
            <Link
              href={tripRoutes.list}
              aria-current={section === "list" ? "page" : undefined}
              className={navLink(true)}
            >
              <Plane size={15} aria-hidden="true" /> Trips
            </Link>
          </nav>
          <p className="ml-auto truncate rounded-full bg-lagoon-tint px-3 py-1 text-sm font-semibold text-lagoon-deep">
            {agency.name}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children(agency)}
      </main>
    </div>
  );
}
