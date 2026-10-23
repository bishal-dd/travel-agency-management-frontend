"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox, Field, SubmitButton, isEmail } from "./fields";
import { authClient } from "@/src/lib/auth-client";
import { safeCallbackUrl, withCallbackUrl } from "@/src/lib/redirect";

const ROUTES = {
  afterSignIn: "/dashboard",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
} as const;

type Status = "idle" | "submitting" | "redirecting";

type FieldErrors = Partial<Record<"email" | "password", string>>;

type Credentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function readCredentials(form: HTMLFormElement): Credentials {
  const data = new FormData(form);
  return {
    email: String(data.get("email") ?? "").trim(),
    password: String(data.get("password") ?? ""),
    rememberMe: data.get("remember") === "on",
  };
}

function validate({ email, password }: Credentials): FieldErrors {
  const errors: FieldErrors = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

function useCallbackUrl() {
  const searchParams = useSearchParams();
  const callbackURL =
    safeCallbackUrl(searchParams.get("callbackURL"), "") || null;

  return {
    callbackURL,
    redirectTo: callbackURL ?? ROUTES.afterSignIn,
    isInvitation: !!callbackURL?.startsWith("/invitation/"),
    prefilledEmail: searchParams.get("email") ?? undefined,
  };
}

export function SignInForm() {
  const router = useRouter();
  const { callbackURL, redirectTo, isInvitation, prefilledEmail } =
    useCallbackUrl();

  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const isBusy = status !== "idle";

  useLayoutEffect(() => {
    const form = formRef.current;
    return () => {
      setStatus("idle");
      setFieldErrors({});
      setFormError("");
      form?.reset();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    const credentials = readCredentials(event.currentTarget);
    const errors = validate(credentials);

    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");

    try {
      const { error } = await authClient.signIn.email(credentials);

      if (error) {
        setFormError(error.message ?? "Sign-in failed.");
        setStatus("idle");
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

  return (
    <>
      {isInvitation && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-lagoon-tint p-3.5 text-sm text-lagoon-deep"
        >
          Sign in with the email address your invitation was sent to.
          You&apos;ll go straight back to the invitation afterwards.
        </p>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isBusy}
        className="mt-8 space-y-5"
      >
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
          autoComplete="current-password"
          error={fieldErrors.password}
          labelAside={
            <Link
              href={ROUTES.forgotPassword}
              className="text-sm font-semibold text-lagoon hover:text-lagoon-deep"
            >
              Forgot password?
            </Link>
          }
        />

        <Checkbox name="remember" defaultChecked>
          Keep me signed in on this device
        </Checkbox>

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <SubmitButton disabled={isBusy}>
          {status === "submitting"
            ? "Signing in..."
            : status === "redirecting"
              ? "Redirecting..."
              : "Sign in"}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        New to Help Make Travel?{" "}
        <Link
          href={withCallbackUrl(ROUTES.signUp, callbackURL)}
          className="font-semibold text-lagoon hover:text-lagoon-deep"
        >
          {isInvitation ? "Create an account" : "Start a free trial"}
        </Link>
      </p>
    </>
  );
}
