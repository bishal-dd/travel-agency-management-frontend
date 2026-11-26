"use client";

import { Menu } from "lucide-react";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { Logo } from "../landing-page/ui/ui";
import { useCan } from "@/src/lib/useCan";
import { HeaderSearch } from "../search/ui/HeaderSearch";

type Props = {
  d: AgencyDashboard;
  onOpenMenu: () => void;
};

export function DashboardTopbar({ d, onOpenMenu }: Props) {
  const { can, ready } = useCan();
  const user = d.session?.user;
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  // Guides only see their own trips, so there's nothing for them to search.
  const canSearch = ready && can({ booking: ["read"] });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 lg:gap-0 lg:px-0">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* On desktop this box is exactly the sidebar's width, so search lines up with the content column */}
      <div className="hidden shrink-0 items-center sm:flex lg:h-full lg:w-[17rem] lg:px-5">
        <Logo />
      </div>

      {canSearch ? <HeaderSearch /> : <div className="min-w-0 flex-1" />}

      {/* On desktop the sidebar footer already shows the user, so the avatar is mobile-only. */}
      <span className="hidden lg:block lg:w-12" aria-hidden="true" />

      {user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover lg:hidden"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-marigold text-xs font-bold lg:hidden"
        >
          {initial}
        </span>
      )}
    </header>
  );
}
