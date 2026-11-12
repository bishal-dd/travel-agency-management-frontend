import {
  PricingSettingsResponse,
  PricingSettingsInput,
} from "../types/pricingSettings";

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

// GET /pricing-settings
export async function getPricingSettings(): Promise<PricingSettingsResponse> {
  const res = await fetch(`${BACKEND_URL}/pricing-settings`, {
    credentials: "include",
  });
  return handleResponse<PricingSettingsResponse>(res);
}

// PATCH /pricing-settings (only what changed)
export async function updatePricingSettings(
  input: PricingSettingsInput,
): Promise<PricingSettingsResponse> {
  const res = await fetch(`${BACKEND_URL}/pricing-settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<PricingSettingsResponse>(res);
}
