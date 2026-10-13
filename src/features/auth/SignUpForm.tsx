"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox, Field, SubmitButton, isEmail } from "./fields";
import { authClient } from "@/src/lib/auth-client";
import { safeCallbackUrl, withCallbackUrl } from "@/src/lib/redirect";

const ROUTES = {
  /** Where new accounts go when they didn't arrive from an invitation or another page. */
  afterSignUp: "/onboarding",
  signIn: "/sign-in",
  terms: "/terms",
  privacy: "/privacy",
} as const;

const MIN_PASSWORD_LENGTH = 8;

type Status = "idle" | "submitting" | "redirecting" | "verify-email";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "terms", string>
>;

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

function readValues(form: HTMLFormElement): SignUpValues {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    password: String(data.get("password") ?? ""),
    acceptedTerms: data.get("terms") !== null,
  };
}

function validate({
  name,
  email,
  password,
  acceptedTerms,
}: SignUpValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!name) errors.name = "Enter your name.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!acceptedTerms) errors.terms = "Accept the terms to create your account.";
  return errors;
}

/** `?callbackURL=` when it's a same-site path, otherwise null. */
function useCallbackUrl() {
  const searchParams = useSearchParams();
  const callbackURL =
    safeCallbackUrl(searchParams.get("callbackURL"), "") || null;

  return {
    callbackURL,
    redirectTo: callbackURL ?? ROUTES.afterSignUp,
    isInvitation: !!callbackURL?.startsWith("/invitation/"),
    prefilledEmail: searchParams.get("email") ?? undefined,
  };
}

/** Page heading. Invited employees join an agency instead of starting a trial. */
export function SignUpIntro() {
  const { isInvitation } = useCallbackUrl();

  return (
    <>
      <h1 className="font-display text-4xl font-medium">
        {isInvitation ? "Create your account" : "Start your free trial"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {isInvitation
          ? "Create an account to accept your invitation and join your team."
          : "14 days with every feature. No credit card needed."}
      </p>
    </>
  );
}

function VerifyEmailNotice({
  email,
  isInvitation,
}: {
  email: string;
  isInvitation: boolean;
}) {
  return (
    <div
      role="status"
      className="mt-8 rounded-2xl bg-lagoon-tint p-5 text-lagoon-deep"
    >
      <p className="font-semibold">Check your email</p>
      <p className="mt-1 text-sm">
        We sent a verification link to{" "}
        <span className="font-semibold">{email}</span>.
        {isInvitation
          ? " Open it to verify your account, and you'll come straight back to your invitation."
          : " Open it to verify your account and continue."}
      </p>
    </div>
  );
}

/**
 * Sign-up form. After creating the account it returns to `?callbackURL=`
 * (e.g. an invitation page), or goes to onboarding when there isn't one.
 * Uses `useSearchParams`, so render it inside <Suspense>.
 */
export function SignUpForm() {
  const router = useRouter();
  const { callbackURL, redirectTo, isInvitation, prefilledEmail } =
    useCallbackUrl();

  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  /** Changing the key remounts the form, clearing every field. */
  const [formKey, setFormKey] = useState(0);

  const isBusy = status === "submitting" || status === "redirecting";

  // Next.js (Cache Components) keeps visited pages alive but hidden with
  // React <Activity>, so this form would keep its state after you leave.
  // Reset it when hidden, so coming back shows a fresh form instead of a
  // disabled "Redirecting..." button, a stale notice or the old password.
  useLayoutEffect(() => {
    return () => {
      setStatus("idle");
      setFieldErrors({});
      setFormError("");
      setSubmittedEmail("");
      setFormKey((key) => key + 1);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    const values = readValues(event.currentTarget);
    const errors = validate(values);

    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");

    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        // Used by the email verification link, if verification is enabled.
        callbackURL: redirectTo,
      });

      if (error) {
        setFormError(error.message ?? "Unable to create your account.");
        setStatus("idle");
        return;
      }

      // With email verification required, Better Auth creates the account
      // but doesn't sign the user in (no token). The link in the email
      // brings them back to `redirectTo`.
      if (!data?.token) {
        setSubmittedEmail(values.email);
        setStatus("verify-email");
        return;
      }

      setStatus("redirecting");
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFormError("Unable to connect to the server. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "verify-email") {
    return (
      <VerifyEmailNotice email={submittedEmail} isInvitation={isInvitation} />
    );
  }

  return (
    <>
      {isInvitation && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-lagoon-tint p-3.5 text-sm text-lagoon-deep"
        >
          Use the email address your invitation was sent to. You&apos;ll go
          straight back to the invitation once your account is ready.
        </p>
      )}

      <form
        key={formKey}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isBusy}
        className="mt-8 space-y-5"
      >
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          error={fieldErrors.name}
        />

        <Field
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@youragency.com"
          defaultValue={prefilledEmail}
          error={fieldErrors.email}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={fieldErrors.password}
        />

        <Checkbox name="terms" error={fieldErrors.terms}>
          I agree to the{" "}
          <Link
            href={ROUTES.terms}
            className="font-semibold text-ink underline underline-offset-2"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href={ROUTES.privacy}
            className="font-semibold text-ink underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </Checkbox>

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <SubmitButton disabled={isBusy}>
          {status === "submitting"
            ? "Creating account..."
            : status === "redirecting"
              ? "Redirecting..."
              : "Create account"}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link
          href={withCallbackUrl(ROUTES.signIn, callbackURL)}
          className="font-semibold text-lagoon hover:text-lagoon-deep"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
