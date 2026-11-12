import type {
  ExchangeRateInput,
  ExchangeRatesResponse,
} from "../types/exchangeRate";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = result?.errors?.[0]?.message;
    const message = result?.message || "Something went wrong";
    throw new Error(detail ? `${message}: ${detail}` : message);
  }
  return result as T;
}

// GET /exchange-rates
export async function getExchangeRates(): Promise<ExchangeRatesResponse> {
  const res = await fetch(`${BACKEND_URL}/exchange-rates`, {
    credentials: "include",
  });
  return handleResponse<ExchangeRatesResponse>(res);
}

// PUT /exchange-rates  (the complete list)
export async function saveExchangeRates(
  rates: ExchangeRateInput[],
): Promise<ExchangeRatesResponse> {
  const res = await fetch(`${BACKEND_URL}/exchange-rates`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rates }),
  });
  return handleResponse<ExchangeRatesResponse>(res);
}
