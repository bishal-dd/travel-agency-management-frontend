const DEFAULT_REDIRECT = "/dashboard";

/**
 * Returns a same-site path to redirect to after auth.
 * Rejects absolute URLs ("https://evil.com") and protocol-relative ones ("//evil.com")
 * so a crafted link can't send users to another site.
 */
export function safeCallbackUrl(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT,
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}

/** Appends ?callbackURL=… to an auth page link when there is one to carry over. */
export function withCallbackUrl(
  path: string,
  callbackURL: string | null | undefined,
) {
  if (!callbackURL) return path;
  return `${path}?callbackURL=${encodeURIComponent(callbackURL)}`;
}
