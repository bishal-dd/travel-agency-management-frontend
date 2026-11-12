import type {
  CreateQuoteInput,
  PublicQuote,
  QuoteResponse,
  QuoteSettingsInput,
  QuoteSettingsResponse,
  QuotesResponse,
} from "../types/quote";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
  withCredentials = true,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: withCredentials ? "include" : "omit",
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = result?.errors?.[0]?.message;
    const message = result?.message || "Something went wrong";
    const error = new Error(
      detail ? `${message}: ${detail}` : message,
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return result as T;
}

// ----- agent (signed in) -----

export const createQuote = (bookingId: string, input: CreateQuoteInput) =>
  send<QuoteResponse>("POST", `/bookings/${bookingId}/quotes`, input);

export const getBookingQuotes = (bookingId: string) =>
  send<QuotesResponse>("GET", `/bookings/${bookingId}/quotes`);

export const getQuote = (quoteId: string) =>
  send<QuoteResponse>("GET", `/quotes/${quoteId}`);

export const revokeQuote = (quoteId: string) =>
  send<QuoteResponse>("POST", `/quotes/${quoteId}/revoke`);

export const getQuoteSettings = () =>
  send<QuoteSettingsResponse>("GET", "/quote-settings");

export const updateQuoteSettings = (input: QuoteSettingsInput) =>
  send<QuoteSettingsResponse>("PATCH", "/quote-settings", input);

// ----- customer (public, no cookies) -----

export const getPublicQuote = (token: string) =>
  send<{ success: boolean; data: PublicQuote }>(
    "GET",
    `/public/quotes/${token}`,
    undefined,
    false,
  );

export const respondToPublicQuote = (
  token: string,
  answer: "accept" | "decline",
  input: { name: string; message?: string | null },
) =>
  send<{ success: boolean; message: string; data: PublicQuote }>(
    "POST",
    `/public/quotes/${token}/${answer}`,
    input,
    false,
  );
