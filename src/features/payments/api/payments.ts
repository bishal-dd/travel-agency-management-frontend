import type {
  BookingPaymentsResponse,
  ListPaymentsParams,
  PaymentSettings,
  PaymentsListResponse,
  Receipt,
  RecordPaymentInput,
  ScheduleInput,
  UpdatePaymentInput,
} from "../types/payment";

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

export const getBookingPayments = (bookingId: string) =>
  send<BookingPaymentsResponse>("GET", `/bookings/${bookingId}/payments`);

export const recordPayment = (bookingId: string, input: RecordPaymentInput) =>
  send<BookingPaymentsResponse>(
    "POST",
    `/bookings/${bookingId}/payments`,
    input,
  );

export const updatePayment = (paymentId: string, input: UpdatePaymentInput) =>
  send<BookingPaymentsResponse>("PATCH", `/payments/${paymentId}`, input);

export const voidPayment = (paymentId: string, reason: string) =>
  send<BookingPaymentsResponse>("POST", `/payments/${paymentId}/void`, {
    reason,
  });

export const savePaymentSchedule = (bookingId: string, input: ScheduleInput) =>
  send<BookingPaymentsResponse>(
    "PUT",
    `/bookings/${bookingId}/payment-schedule`,
    input,
  );

export function listPayments(params: ListPaymentsParams = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== "" && v !== false) q.set(k, String(v));
  const qs = q.toString();
  return send<PaymentsListResponse>("GET", `/payments${qs ? `?${qs}` : ""}`);
}

export const getReceipt = (paymentId: string) =>
  send<{ success: boolean; data: Receipt }>(
    "GET",
    `/payments/${paymentId}/receipt`,
  );

export const getPaymentSettings = () =>
  send<{ success: boolean; data: PaymentSettings }>("GET", "/payment-settings");

export const updatePaymentSettings = (
  input: Partial<Omit<PaymentSettings, "updatedAt">>,
) =>
  send<{ success: boolean; data: PaymentSettings }>(
    "PATCH",
    "/payment-settings",
    input,
  );
