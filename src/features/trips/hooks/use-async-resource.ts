"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../passport/repository";

type Result<T> = {
  key: string;
  refreshKey: number;
  data: T | null;
  error: string;
};

/**
 * Loads data for `key` and ignores responses for keys that are no longer current.
 * Keeps the previous data on screen while refreshing the same key.
 * `load` must be stable (wrap it in useCallback).
 */
export function useAsyncResource<T>(
  key: string | null,
  load: () => Promise<T>,
) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    load().then(
      (data) => {
        if (!cancelled) setResult({ key, refreshKey, data, error: "" });
      },
      (error: unknown) => {
        if (!cancelled)
          setResult({
            key,
            refreshKey,
            data: null,
            error: errorMessage(error),
          });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [key, refreshKey, load]);

  const sameKey = !!key && result?.key === key;
  const isCurrent = sameKey && result?.refreshKey === refreshKey;

  return {
    data: sameKey ? (result?.data ?? null) : null,
    error: isCurrent ? (result?.error ?? "") : "",
    isLoading: !!key && !sameKey,
    isRefreshing: sameKey && !isCurrent,
    refresh: useCallback(() => setRefreshKey((value) => value + 1), []),
  };
}
