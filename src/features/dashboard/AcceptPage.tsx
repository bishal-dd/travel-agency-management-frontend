"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Check,
  CircleAlert,
  LoaderCircle,
  Mail,
  MailX,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";

/* -------------------------------------------------------------------------- */
/* Routes: keep these in line with your app folders.                          */
/* -------------------------------------------------------------------------- */

const ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  accept: "/invitation/accept",
} as const;

/* -------------------------------------------------------------------------- */
/* Types and helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Shape returned by `authClient.organization.getInvitation`.
 * Better Auth returns `organizationName` and `inviterEmail`; the nested
 * `organization` / `inviter` objects are kept in case a custom endpoint adds them.
 */
type InvitationDetails = {
  id: string;
  email: string;
  role?: string;
  status: string;
  expiresAt: string | Date;
  organizationName?: string;
  inviterEmail?: string;
  organization?: { name: string };
  inviter?: { name: string };
};

type LoadResult = {
  key: string;
  invitation: InvitationDetails | null;
  error: string;
  /** The invitation exists but was sent to another email address. */
  wrongRecipient: boolean;
  isExpired: boolean;
};

type AuthError =
  | { message?: string; status?: number; code?: string }
  | null
  | undefined;

function describeLoadError(error: AuthError) {
  if (
    error?.code === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION" ||
    error?.status === 403
  ) {
    return {
      wrongRecipient: true,
      message: "This invitation was sent to a different email address.",
    };
  }
  if (error?.status === 400 || error?.status === 404) {
    return {
      wrongRecipient: false,
      message:
        "We couldn't find this invitation. It may have expired, been cancelled or already been used.",
    };
  }
  return {
    wrongRecipient: false,
    message:
      error?.message ??
      "We couldn't find this invitation. It may have expired or been cancelled.",
  };
}

/** Sign-in / sign-up link that brings the user back to this invitation afterwards. */
function authLink(base: string, invitationId: string) {
  const callbackURL = `${ROUTES.accept}?id=${encodeURIComponent(invitationId)}`;
  return `${base}?callbackURL=${encodeURIComponent(callbackURL)}`;
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

/* -------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

const buttonBase =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButton = `${buttonBase} bg-ink text-white hover:bg-lagoon-deep`;
const secondaryButton = `${buttonBase} bg-white text-ink ring-1 ring-line ring-inset hover:ring-ink/40`;

function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-left text-sm text-red-800 ring-1 ring-red-200 ring-inset"
    >
      <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function InfoMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl bg-lagoon-tint p-3.5 text-sm text-lagoon-deep"
    >
      {children}
    </p>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-mist px-5 py-10">
      {children}
    </main>
  );
}

function StatusCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-line">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lagoon-tint text-lagoon-deep">
          <Icon size={24} aria-hidden="true" />
        </span>
        <h1 className="font-display mt-5 text-3xl leading-tight font-medium">
          {title}
        </h1>
        {children}
      </section>
    </PageShell>
  );
}

function LoadingCard() {
  return (
    <PageShell>
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center text-sm text-ink-soft shadow-lg ring-1 ring-line">
        <Spinner label="Loading invitation..." />
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function AcceptInvitation() {
  const router = useRouter();
  const invitationId = useSearchParams().get("id");
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user ?? null;

  const [result, setResult] = useState<LoadResult | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [actionError, setActionError] = useState("");

  // Better Auth only returns an invitation to its signed-in recipient,
  // so it is loaded once a session exists, never for signed-out visitors.
  const requestKey = invitationId && user ? `${invitationId}:${user.id}` : null;

  useEffect(() => {
    if (!invitationId || !requestKey) return;

    let cancelled = false;
    const settle = (next: Omit<LoadResult, "key">) => {
      if (!cancelled) setResult({ key: requestKey, ...next });
    };

    authClient.organization
      .getInvitation({ query: { id: invitationId } })
      .then(({ data, error }) => {
        if (error || !data) {
          const { message, wrongRecipient } = describeLoadError(error);
          settle({
            invitation: null,
            error: message,
            wrongRecipient,
            isExpired: false,
          });
          return;
        }
        const invitation = data as InvitationDetails;
        settle({
          invitation,
          error: "",
          wrongRecipient: false,
          isExpired: new Date(invitation.expiresAt).getTime() <= Date.now(),
        });
      })
      .catch(() =>
        settle({
          invitation: null,
          error: "Unable to load this invitation. Please try again.",
          wrongRecipient: false,
          isExpired: false,
        }),
      );

    return () => {
      cancelled = true;
    };
  }, [invitationId, requestKey]);

  // Next.js (Cache Components) keeps visited pages alive but hidden with
  // React <Activity>. Reset when hidden, so opening another invitation later
  // doesn't show "Invitation accepted!" and a stuck, disabled button, and the
  // previous invitation isn't shown while the new one loads.
  useLayoutEffect(() => {
    return () => {
      setResult(null);
      setIsAccepting(false);
      setIsRedirecting(false);
      setIsSwitching(false);
      setActionError("");
    };
  }, []);

  const current = result?.key === requestKey ? result : null;
  const invitation = current?.invitation ?? null;

  async function handleAccept() {
    if (!invitationId || !user || !invitation || isAccepting || isRedirecting)
      return;

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      setActionError(
        `This invitation is for ${invitation.email}. Please sign in with that email address.`,
      );
      return;
    }

    setIsAccepting(true);
    setActionError("");

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        setActionError(error.message ?? "Unable to accept this invitation.");
        return;
      }

      // Better Auth also makes the joined agency the active one.
      setIsRedirecting(true);
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch {
      setActionError("Unable to accept the invitation. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  }

  /** Sign out of the current account, then sign in again with the invited one. */
  async function handleSwitchAccount() {
    if (!invitationId || isSwitching) return;
    setIsSwitching(true);
    setActionError("");

    try {
      const { error } = await authClient.signOut();
      if (error) {
        setActionError("Unable to sign out. Please try again.");
        return;
      }
      router.replace(authLink(ROUTES.signIn, invitationId));
    } catch {
      setActionError("Unable to sign out. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  }

  // 1. The link has no invitation ID
  if (!invitationId) {
    return (
      <StatusCard icon={MailX} title="Invitation unavailable">
        <div className="mt-6">
          <ErrorMessage>
            This invitation link is missing its invitation ID.
          </ErrorMessage>
        </div>
        <Link
          href={user ? ROUTES.dashboard : ROUTES.signIn}
          className={`${secondaryButton} mt-6`}
        >
          {user ? "Go to dashboard" : "Go to sign in"}
        </Link>
      </StatusCard>
    );
  }

  // 2. Waiting for the session
  if (isSessionPending) return <LoadingCard />;

  // 3. Signed out: sign in or sign up first, then come back here
  if (!user) {
    return (
      <StatusCard icon={Mail} title="You've been invited to Tripdesk">
        <p className="mt-3 text-ink-soft">
          Sign in or create an account using the email address the invitation
          was sent to. You&apos;ll come straight back here to accept it.
        </p>
        <div className="mt-7 space-y-3">
          <Link
            href={authLink(ROUTES.signIn, invitationId)}
            className={primaryButton}
          >
            Sign in to accept
          </Link>
          <Link
            href={authLink(ROUTES.signUp, invitationId)}
            className={secondaryButton}
          >
            Create an account
          </Link>
        </div>
      </StatusCard>
    );
  }

  // 4. Loading the invitation
  if (!current) return <LoadingCard />;

  // 5. Couldn't load it: wrong account, expired, cancelled or network error
  if (!invitation) {
    return (
      <StatusCard
        icon={MailX}
        title={
          current.wrongRecipient ? "Wrong account" : "Invitation unavailable"
        }
      >
        <div className="mt-6 space-y-4">
          <ErrorMessage>{current.error}</ErrorMessage>
          <p className="text-sm text-ink-soft">
            You&apos;re signed in as{" "}
            <span className="font-semibold text-ink">{user.email}</span>.
          </p>
          {actionError && <ErrorMessage>{actionError}</ErrorMessage>}
        </div>
        <div className="mt-6 space-y-3">
          {current.wrongRecipient && (
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isSwitching}
              className={primaryButton}
            >
              {isSwitching ? (
                <Spinner label="Signing out..." />
              ) : (
                "Use a different account"
              )}
            </button>
          )}
          <Link href={ROUTES.dashboard} className={secondaryButton}>
            Go to dashboard
          </Link>
        </div>
      </StatusCard>
    );
  }

  // 6. The invitation
  const agencyName =
    invitation.organization?.name ??
    invitation.organizationName ??
    "a travel agency";
  const invitedBy = invitation.inviter?.name ?? invitation.inviterEmail;
  const canAccept = invitation.status === "pending" && !current.isExpired;
  const statusLabel = current.isExpired
    ? "Expired"
    : capitalize(invitation.status);
  const emailMatches =
    invitation.email.toLowerCase() === user.email.toLowerCase();

  const details: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Mail, label: "Invited email", value: invitation.email },
    ...(invitedBy
      ? [{ icon: UserRound, label: "Invited by", value: invitedBy }]
      : []),
    ...(invitation.role
      ? [
          {
            icon: ShieldCheck,
            label: "Role",
            value: capitalize(invitation.role),
          },
        ]
      : []),
    {
      icon: CalendarClock,
      label: "Expires",
      value: formatDate(invitation.expiresAt),
    },
  ];

  return (
    <PageShell>
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-line">
        <div className="bg-lagoon-deep px-7 pt-8 pb-7 text-white">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-marigold text-base font-bold text-ink">
              {initials(agencyName)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                canAccept
                  ? "bg-marigold-tint text-ink"
                  : "bg-white/15 text-white"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-5 text-sm text-white/70">
            You&apos;ve been invited to join
          </p>
          <h1 className="font-display mt-1 text-3xl leading-tight font-medium break-words">
            {agencyName}
          </h1>
        </div>

        <div className="p-7">
          <dl className="space-y-3.5">
            {details.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mist text-ink-soft">
                  <item.icon size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-ink-soft">{item.label}</dt>
                  <dd className="truncate text-sm font-semibold">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-7 space-y-4">
            {actionError && <ErrorMessage>{actionError}</ErrorMessage>}
            {isRedirecting && (
              <InfoMessage>
                Invitation accepted! Redirecting to your dashboard...
              </InfoMessage>
            )}

            {!canAccept ? (
              <>
                <InfoMessage>
                  {current.isExpired
                    ? "This invitation has expired. Ask the agency owner to send a new one."
                    : "This invitation is no longer pending."}
                </InfoMessage>
                <Link href={ROUTES.dashboard} className={secondaryButton}>
                  Go to dashboard
                </Link>
              </>
            ) : !emailMatches ? (
              <>
                <ErrorMessage>
                  This invitation is for {invitation.email}, but you&apos;re
                  signed in as {user.email}.
                </ErrorMessage>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  disabled={isSwitching}
                  className={primaryButton}
                >
                  {isSwitching ? (
                    <Spinner label="Signing out..." />
                  ) : (
                    "Use a different account"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isAccepting || isRedirecting}
                  className={primaryButton}
                >
                  {isAccepting ? (
                    <Spinner label="Accepting invitation..." />
                  ) : isRedirecting ? (
                    <Spinner label="Opening your dashboard..." />
                  ) : (
                    <>
                      <Check size={17} aria-hidden="true" /> Accept invitation
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-ink-soft">
                  Signed in as{" "}
                  <span className="font-semibold text-ink">{user.email}</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/** `useSearchParams` reads the URL, so it must sit inside a Suspense boundary. */
export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <AcceptInvitation />
    </Suspense>
  );
}
