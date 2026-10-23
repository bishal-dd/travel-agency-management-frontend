import { Suspense } from "react";
import type { Metadata } from "next";
import { SignUpForm, SignUpIntro } from "@/src/features/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account | Help Make Travel",
};

export default function SignUpPage() {
  return (
    // Both components read ?callbackURL= from the URL, which needs a Suspense boundary.
    <Suspense fallback={<div className="h-[34rem]" aria-hidden="true" />}>
      <SignUpIntro />
      <SignUpForm />
    </Suspense>
  );
}
