"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { roleLabel } from "@/src/features/team/roles";

type Props = Pick<
  AgencyDashboard,
  | "session"
  | "organizations"
  | "activeOrganization"
  | "isLoadingOrganizations"
  | "isSwitching"
  | "handleOrganizationChange"
>;

type Org = { id: string; name: string; logo?: string | null };

/** Logo, or the agency's first letter. */
function AgencyMark({ org, size = "md" }: { org: Org; size?: "sm" | "md" }) {
  const box =
    size === "sm" ? "size-7 rounded-lg text-xs" : "size-9 rounded-xl text-sm";
  return org.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={org.logo}
      alt=""
      className={`${box} shrink-0 bg-white object-contain ring-1 ring-line`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${box} grid shrink-0 place-items-center bg-ink font-bold text-white`}
    >
      {org.name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * The agency you're working in, at the top of the sidebar.
 * One agency: a plain card. Several: the card opens a list to switch.
 */
export function AgencySwitcher({
  session,
  organizations,
  activeOrganization,
  isLoadingOrganizations,
  isSwitching,
  handleOrganizationChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Loading, or picking an agency right after sign-in: a quiet skeleton, not text.
  if (
    isLoadingOrganizations ||
    (!activeOrganization && organizations?.length)
  ) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl p-2"
        aria-label="Loading agency"
      >
        <div className="size-9 animate-pulse rounded-xl bg-mist" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-mist" />
          <div className="h-2.5 w-14 animate-pulse rounded bg-mist" />
        </div>
      </div>
    );
  }

  if (!organizations?.length || !activeOrganization) {
    return (
      <div className="rounded-xl bg-mist p-3 text-sm">
        <p className="text-ink-soft">You don&apos;t belong to an agency yet.</p>
        <Link
          href="/onboarding"
          className="mt-1 inline-block font-semibold text-lagoon-deep hover:underline"
        >
          Create an agency
        </Link>
      </div>
    );
  }

  const active = activeOrganization as Org & {
    members?: { userId: string; role: string }[];
  };
  const myRole = active.members?.find(
    (m) => m.userId === session?.user.id,
  )?.role;
  const many = organizations.length > 1;

  const card = (
    <>
      <AgencyMark org={active} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-ink">
          {active.name}
        </span>
        <span className="block truncate text-xs text-ink-soft">
          {isSwitching ? "Switching…" : myRole ? roleLabel(myRole) : "Agency"}
        </span>
      </span>
    </>
  );

  if (!many) {
    return <div className="flex items-center gap-3 rounded-xl p-2">{card}</div>;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isSwitching}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Agency: ${active.name}. Switch agency`}
        className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-mist disabled:opacity-70"
      >
        {card}
        {isSwitching ? (
          <Loader2
            size={15}
            className="shrink-0 animate-spin text-ink-soft"
            aria-hidden="true"
          />
        ) : (
          <ChevronsUpDown
            size={15}
            className="shrink-0 text-ink-soft"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-line bg-white p-1 shadow-lg">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Your agencies
          </p>
          <ul
            role="listbox"
            aria-label="Agencies"
            className="max-h-72 overflow-y-auto"
          >
            {(organizations as Org[]).map((org) => {
              const current = org.id === active.id;
              return (
                <li key={org.id} role="option" aria-selected={current}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (!current) void handleOrganizationChange(org.id);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      current
                        ? "bg-lagoon-tint text-lagoon-deep"
                        : "text-ink hover:bg-mist"
                    }`}
                  >
                    <AgencyMark org={org} size="sm" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {org.name}
                    </span>
                    {current && <Check size={15} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 border-t border-line pt-1">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft hover:bg-mist hover:text-ink"
            >
              <span className="grid size-7 place-items-center rounded-lg border border-dashed border-line">
                <Plus size={14} aria-hidden="true" />
              </span>
              Create an agency
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
