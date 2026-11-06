"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { Logo } from "../landing-page/ui/ui";

type Props = {
  d: AgencyDashboard;
  onOpenMenu: () => void;
};

export function DashboardTopbar({ d, onOpenMenu }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const user = d.session?.user;
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  // Press "/" anywhere (outside a text field) to jump to search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const typing =
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (q) router.push(`/dashboard/search?q=${encodeURIComponent(q)}`);
  }

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

      <form
        role="search"
        onSubmit={onSubmit}
        className="min-w-0 flex-1 sm:max-w-sm lg:ml-12"
      >
        <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30">
          <Search size={14} aria-hidden="true" className="shrink-0" />
          <span className="sr-only">Search</span>
          <input
            ref={inputRef}
            name="q"
            type="search"
            placeholder="Search customers, bookings, documents"
            className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
          />
          <kbd className="hidden rounded border border-line bg-white px-1.5 text-[10px] font-semibold sm:inline">
            /
          </kbd>
        </label>
      </form>

      <button
        type="button"
        aria-label="Notifications"
        className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
      >
        <Bell size={16} />
      </button>

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
