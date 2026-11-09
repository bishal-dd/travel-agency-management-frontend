"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { DashboardProvider } from "./DashboardContext";
import { useAgencyDashboard } from "./useAgencyDashboard";
import { CenteredState, Loading } from "./parts";

/**
 * Closes the mobile drawer on navigation. It's the only place the shell reads
 * the URL, and it sits in its own <Suspense> so the rest of the layout can
 * still prerender on dynamic routes like /dashboard/hotels/[hotelId].
 */
function CloseOnNavigate({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  useEffect(() => {
    onNavigate();
  }, [pathname, onNavigate]);
  return null;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const d = useAgencyDashboard();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isReady = !d.isSessionPending && !d.sessionError && !!d.session;

  // While the drawer is open: lock page scroll, close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <DashboardProvider value={d}>
      <Suspense fallback={null}>
        <CloseOnNavigate onNavigate={closeMenu} />
      </Suspense>

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

      {/*
        Always render {children}: Next.js instant-navigation validation fails
        ("segment was dropped") if the layout ever omits them. The shell is
        just hidden until the session is ready.
      */}
      <div hidden={!isReady} className="min-h-dvh bg-paper">
        {/* Full-width bar across the top, above the sidebar */}
        {isReady && (
          <DashboardTopbar d={d} onOpenMenu={() => setMenuOpen(true)} />
        )}

        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* Desktop sidebar: sticks below the 4rem top bar */}
          <div className="hidden border-r border-line bg-white lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)]">
            {isReady && <DashboardSidebar d={d} />}
          </div>

          {/* The page-change rise animation now lives in dashboard/template.tsx */}
          <main className="min-w-0 p-5 sm:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {isReady && menuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-rise relative flex h-dvh w-[17rem] max-w-[85vw] flex-col bg-white shadow-deep [animation-duration:0.25s]">
            <div className="flex h-16 shrink-0 items-center justify-end border-b border-line px-3">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <DashboardSidebar d={d} />
            </div>
          </div>
        </div>
      )}
    </DashboardProvider>
  );
}
