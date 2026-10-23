import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/src/features/auth/SignInForm";

export const metadata: Metadata = { title: "Sign in | Help Make Travel" };

export default function SignInPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-medium">Welcome back</h1>
      <p className="mt-3 text-ink-soft">
        Sign in to pick up where your agency left off.
      </p>
      {/* SignInForm reads ?callbackURL= from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={<div className="mt-8 h-80" aria-hidden="true" />}>
        <SignInForm />
      </Suspense>
    </>
  );
}
