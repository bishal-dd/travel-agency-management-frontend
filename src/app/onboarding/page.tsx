"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Link2, UserPlus } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import {
  Spinner,
  ButtonLink,
  Logo,
  TextField,
  Alert,
  Button,
  Avatar,
  LogoMark,
} from "@/src/components/ui";
import { routes } from "@/src/config/routes";

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;

/** "Himalayan Adventures!" -> "himalayan-adventures" */
function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Returns an error message, or an empty string when the name is usable. */
function validateAgencyName(name: string) {
  if (name.length < NAME_MIN_LENGTH)
    return `Use at least ${NAME_MIN_LENGTH} characters.`;
  if (name.length > NAME_MAX_LENGTH)
    return `Use ${NAME_MAX_LENGTH} characters or fewer.`;
  if (!toSlug(name)) return "Include at least one letter or number.";
  return "";
}

const nextSteps = [
  {
    icon: UserPlus,
    title: "Invite your team",
    body: "Add agents and admins from the Team page.",
  },
  {
    icon: Building2,
    title: "Switch between agencies",
    body: "Run more than one agency from the same account.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [agencyName, setAgencyName] = useState("");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useLayoutEffect(() => {
    return () => {
      setAgencyName("");
      setNameError("");
      setError("");
      setIsCreating(false);
      setIsRedirecting(false);
    };
  }, []);

  const trimmedName = agencyName.trim();
  const slug = toSlug(trimmedName);
  const isBusy = isCreating || isRedirecting;

  function handleNameChange(value: string) {
    setAgencyName(value);
    if (nameError) setNameError("");
    if (error) setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    const validationError = validateAgencyName(trimmedName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      const { data: organization, error: createError } =
        await authClient.organization.create({
          name: trimmedName,
          slug,
        });

      if (createError) {
        setError(createError.message ?? "Failed to create agency.");
        return;
      }

      if (!organization) {
        setError("Agency was created, but its details were not returned.");
        return;
      }

      const { error: activeError } = await authClient.organization.setActive({
        organizationId: organization.id,
      });

      if (activeError) {
        setError(
          "Agency was created, but we couldn't select it as active. Please try again.",
        );
        return;
      }

      setIsRedirecting(true);
      router.replace(routes.dashboard.overview);
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsCreating(false);
    }
  }

  if (isPending) {
    return (
      <CenteredCard>
        <Spinner label="Loading..." className="mt-5" />
      </CenteredCard>
    );
  }

  if (!session) {
    return (
      <CenteredCard>
        <p className="font-display mt-5 text-2xl font-medium">
          Sign in to continue
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Please sign in to create your travel agency.
        </p>
        <ButtonLink href={routes.signIn} className="mt-6">
          Go to sign in
        </ButtonLink>
      </CenteredCard>
    );
  }

  const firstName = session.user.name?.trim().split(/\s+/)[0];

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form */}
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header>
          <Logo />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">
            <p className="text-sm font-semibold text-lagoon">
              {firstName ? `Welcome, ${firstName}` : "Welcome to Help Make Travel"}
            </p>
            <h1 className="font-display mt-2 text-4xl leading-tight font-medium">
              Create your travel agency
            </h1>
            <p className="mt-3 text-ink-soft">
              Set up your agency workspace to get started. You can invite your
              team right after.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <TextField
                label="Agency name"
                name="agencyName"
                icon={Building2}
                value={agencyName}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="e.g. Himalayan Adventures"
                autoComplete="organization"
                minLength={NAME_MIN_LENGTH}
                maxLength={NAME_MAX_LENGTH}
                required
                autoFocus
                disabled={isBusy}
                error={nameError || undefined}
                hint={
                  slug
                    ? undefined
                    : "This is how your agency appears to your team."
                }
              />

              {slug && !nameError && (
                <p className="-mt-2 flex items-center gap-2 text-sm text-ink-soft">
                  <Link2 size={14} className="shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">
                    Workspace ID:{" "}
                    <span className="font-semibold text-ink">{slug}</span>
                  </span>
                </p>
              )}

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isBusy || !trimmedName}
              >
                {isCreating ? (
                  <Spinner
                    label="Creating agency..."
                    className="text-current"
                  />
                ) : isRedirecting ? (
                  <Spinner
                    label="Opening your dashboard..."
                    className="text-current"
                  />
                ) : (
                  "Create agency"
                )}
              </Button>
            </form>
          </div>
        </main>

        <footer className="text-sm text-ink-soft">
          Signed in as{" "}
          <span className="font-semibold text-ink">{session.user.email}</span>
        </footer>
      </div>

      {/* Live preview */}
      <aside className="relative hidden overflow-hidden bg-lagoon-deep text-white lg:flex lg:flex-col lg:justify-center lg:p-14 xl:p-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_100%_0%,transparent_0_44px,rgb(255_255_255/0.05)_44px_45px)]"
        />

        <div className="relative w-full max-w-md">
          <p className="text-sm text-white/70">Your workspace preview</p>

          <div className="mt-4 rounded-3xl bg-white p-6 text-ink shadow-deep">
            <div className="flex items-center gap-4">
              <Avatar
                name={trimmedName || "Your agency"}
                size="lg"
                tone="lagoon"
                shape="square"
              />
              <div className="min-w-0">
                <p className="font-display truncate text-2xl font-medium">
                  {trimmedName || "Your agency"}
                </p>
                <p className="truncate text-sm text-ink-soft">
                  {slug || "your-agency"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mist p-3.5">
              <Avatar
                name={session.user.name || session.user.email}
                size="sm"
                tone="marigold"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {session.user.name || session.user.email}
                </p>
                <p className="truncate text-xs text-ink-soft">
                  {session.user.email}
                </p>
              </div>
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">
                Owner
              </span>
            </div>
          </div>

          <ul className="mt-10 space-y-5">
            {nextSteps.map((step) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-marigold">
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm text-white/70">{step.body}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-marigold">
                <Check size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">You&apos;ll be the owner</p>
                <p className="mt-0.5 text-sm text-white/70">
                  Owners can manage the agency and everyone in it.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="contours grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-line">
        <LogoMark className="mx-auto" />
        {children}
      </div>
    </main>
  );
}
