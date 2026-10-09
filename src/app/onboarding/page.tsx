"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [agencyName, setAgencyName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const slug = agencyName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: organization, error: createError } =
        await authClient.organization.create({
          name: agencyName.trim(),
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

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsCreating(false);
    }
  }

  if (isPending) {
    return <main className="p-8">Loading...</main>;
  }

  if (!session) {
    return (
      <main className="space-y-4 p-8">
        <p>Please sign in to create your travel agency.</p>
        <button
          onClick={() => router.replace("/signin")}
          className="rounded-md border px-4 py-2"
        >
          Go to sign in
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border p-8"
      >
        <h1 className="text-2xl font-semibold">Create your travel agency</h1>

        <p className="text-sm text-gray-500">
          Set up your agency workspace to get started.
        </p>

        <div className="space-y-1">
          <label htmlFor="agencyName">Agency name</label>
          <input
            id="agencyName"
            value={agencyName}
            onChange={(event) => setAgencyName(event.target.value)}
            placeholder="e.g. Himalayan Adventures"
            minLength={2}
            maxLength={100}
            required
            className="w-full rounded-md border p-2"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isCreating || !agencyName.trim()}
          className="w-full rounded-md bg-black p-2 text-white disabled:opacity-50"
        >
          {isCreating ? "Creating agency..." : "Create agency"}
        </button>
      </form>
    </main>
  );
}
