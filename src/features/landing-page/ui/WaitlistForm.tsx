"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useJoinWaitlist } from "../hooks/useJoinWaitlist";

export function WaitlistForm() {
  const [email, setEmail] = useState("");

  const { mutate, isPending, isSuccess, error, reset } = useJoinWaitlist();

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    mutate(
      { email: normalizedEmail },
      {
        onSuccess: () => {
          setEmail("");
        },
      },
    );
  }

  function handleEmailChange(value: string) {
    setEmail(value);

    if (error) {
      reset();
    }
  }

  function handleAddAnotherEmail() {
    reset();
    setEmail("");
  }

  if (isSuccess) {
    return (
      <div
        role="status"
        className="flex w-full max-w-xl items-start gap-3 rounded-2xl border border-lagoon/20 bg-lagoon-tint p-4 sm:p-5"
      >
        <CheckCircle2
          size={23}
          className="mt-0.5 shrink-0 text-lagoon"
          aria-hidden="true"
        />

        <div>
          <p className="font-semibold text-ink">You're on the list!</p>

          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Thanks for your interest in Help Make Travel. We'll keep you updated
            as we get closer to launch.
          </p>

          <button
            type="button"
            onClick={handleAddAnotherEmail}
            className="mt-3 text-sm font-semibold text-lagoon underline underline-offset-4"
          >
            Add another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Your work email address</span>

          <Mail
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
          />

          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            required
            maxLength={254}
            disabled={isPending}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "waitlist-error" : "waitlist-hint"}
            className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink-soft/70 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lagoon/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden="true"
              />
              Joining...
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {error ? (
        <p
          id="waitlist-error"
          role="alert"
          className="mt-3 text-sm font-medium text-red-600"
        >
          {errorMessage}
        </p>
      ) : (
        <div
          id="waitlist-hint"
          className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-soft"
        >
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-lagoon"
            aria-hidden="true"
          />

          <p>No spam. Just product updates and early-access news.</p>
        </div>
      )}
    </div>
  );
}
