import type { SearchGroup } from "../types/search";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function searchEverything(
  q: string,
  signal?: AbortSignal,
): Promise<SearchGroup[]> {
  const res = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(q)}`, {
    credentials: "include",
    signal,
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) throw new Error(result?.message || "Search failed");
  return result.data as SearchGroup[];
}
