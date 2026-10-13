"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plane, Users } from "lucide-react";
import { AgencySwitcher } from "./AgencySwitcher";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { Logo } from "../landing-page/ui/ui";

export function DashboardSidebar({ d }: { d: AgencyDashboard }) {
  const pathname = usePathname();
  const user = d.session?.user;

  const isOverview = pathname === "/dashboard";
  const isTrips = pathname.startsWith("/dashboard/trips");
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <aside className="flex min-h-dvh flex-col gap-6 border-b border-line bg-white p-5 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
      <Logo />

      <AgencySwitcher {...d} />

      <nav aria-label="Dashboard" className="space-y-1">
        <Link
          href="/dashboard"
          aria-current={isOverview ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            isOverview
              ? "bg-lagoon-tint text-lagoon-deep"
              : "text-ink-soft hover:bg-mist hover:text-ink"
          }`}
        >
          <Users size={16} />
          Team
        </Link>

        <Link
          href="/dashboard/trips"
          aria-current={isTrips ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            isTrips
              ? "bg-lagoon-tint text-lagoon-deep"
              : "text-ink-soft hover:bg-mist hover:text-ink"
          }`}
        >
          <Plane size={16} />
          Trips
        </Link>
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-line pt-5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold text-sm font-bold"
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-ink-soft">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={d.handleSignOut}
          aria-label="Sign out"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink ring-1 ring-inset ring-line transition-colors hover:ring-ink/40"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
