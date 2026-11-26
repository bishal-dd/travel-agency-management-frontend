import type {
  AccountsSummary,
  BookingOption,
  ListedSupplierType,
  Payee,
  Period,
  RecordSupplierPaymentInput,
  TransactionsResponse,
} from "../types/accounts";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(
      result?.message || "Something went wrong",
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return result as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

export const getAccountsSummary = (p: Period) =>
  send<{ success: boolean; data: AccountsSummary }>(
    "GET",
    `/accounts/summary${qs({ from: p.from, to: p.to })}`,
  );

export interface TransactionsParams extends Period {
  direction?: "in" | "out";
  page?: number;
  limit?: number;
}
export const listTransactions = (p: TransactionsParams) =>
  send<TransactionsResponse>("GET", `/accounts/transactions${qs({ ...p })}`);

export const recordSupplierPayment = (input: RecordSupplierPaymentInput) =>
  send<{ success: boolean }>("POST", "/accounts/supplier-payments", input);

export const voidSupplierPayment = (paymentId: string, reason: string) =>
  send<{ success: boolean }>(
    "POST",
    `/accounts/supplier-payments/${paymentId}/void`,
    { reason },
  );

export const listPayees = (type: ListedSupplierType, q?: string) =>
  send<{ success: boolean; data: Payee[] }>(
    "GET",
    `/accounts/payees${qs({ type, q })}`,
  );

export const listBookingOptions = (q?: string) =>
  send<{ success: boolean; data: BookingOption[] }>(
    "GET",
    `/accounts/booking-options${qs({ q })}`,
  );
