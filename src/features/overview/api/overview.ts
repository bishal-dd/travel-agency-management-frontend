import type { Overview } from "../types/overview";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getOverview(): Promise<{
  success: boolean;
  data: Overview;
}> {
  const res = await fetch(`${BACKEND_URL}/overview`, {
    credentials: "include",
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) throw new Error(result?.message || "Couldn't load the overview");
  return result;
}
