export type PaymentKind = "payment" | "refund";
export type PaymentMethod =
  | "bank_transfer"
  | "card"
  | "online"
  | "cash"
  | "wallet"
  | "other";
export type PaymentStatus =
  | "nothing_due"
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "overpaid";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online payment" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "Mobile wallet" },
  { value: "other", label: "Other" },
];
export const methodLabel = (m: PaymentMethod) =>
  PAYMENT_METHODS.find((x) => x.value === m)?.label ?? m;

export interface Payment {
  id: string;
  bookingId: string;
  /** "HMT-0003-R1" */
  receiptNumber: string;
  kind: PaymentKind;
  method: PaymentMethod;
  /** As received, in `currency`. */
  amount: string;
  currency: string;
  /** Booking-currency units per 1 `currency`. */
  fxRate: string;
  /** What counts towards the balance, in the booking currency. */
  bookingAmount: string;
  paidOn: string;
  reference: string | null;
  notes: string | null;
  recordedBy: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  createdAt: string;
}

export interface ScheduleRow {
  id: string;
  position: number;
  label: string;
  dueDate: string;
  percent: string | null;
  amount: string | null;
}

export interface Installment {
  id: string | null;
  label: string;
  dueDate: string;
  percent: string | null;
  isBalance: boolean;
  amount: string;
  paid: string;
  remaining: string;
  overdue: boolean;
}

/** Also on BookingDetail as `payment`. */
export interface PaymentSummary {
  total: string;
  received: string;
  refunded: string;
  paid: string;
  /** Negative when overpaid. */
  balance: string;
  status: PaymentStatus;
  installments: Installment[];
  nextDue: {
    label: string;
    dueDate: string;
    amount: string;
    overdue: boolean;
  } | null;
  overdueAmount: string;
  unscheduled: string;
}

export interface BookingPayments {
  bookingId: string;
  currency: string;
  payments: Payment[];
  schedule: ScheduleRow[];
  summary: PaymentSummary;
}

export interface BookingPaymentsResponse {
  success: boolean;
  message?: string;
  data: BookingPayments;
}

export interface RecordPaymentInput {
  kind: PaymentKind;
  method: PaymentMethod;
  amount: string;
  currency: string;
  fxRate?: string;
  paidOn: string;
  reference?: string | null;
  notes?: string | null;
}
export type UpdatePaymentInput = Partial<
  Pick<RecordPaymentInput, "method" | "paidOn" | "reference" | "notes">
>;

export interface ScheduleInput {
  installments: {
    label: string;
    dueDate: string;
    percent?: string | null;
    amount?: string | null;
  }[];
}

export interface PaymentListItem extends Payment {
  booking: { id: string; reference: string; title: string; currency: string };
  customer: { id: string; name: string };
}
export interface PaymentsListResponse {
  success: boolean;
  data: PaymentListItem[];
  totals: { currency: string; received: string; refunded: string }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ListPaymentsParams {
  from?: string;
  to?: string;
  method?: PaymentMethod;
  kind?: PaymentKind;
  search?: string;
  includeVoided?: boolean;
  page?: number;
  limit?: number;
}

export interface Receipt {
  agency: { name: string; logo: string | null };
  payment: Payment;
  booking: {
    id: string;
    reference: string;
    title: string;
    startDate: string;
    endDate: string;
    currency: string;
  } | null;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    country: string | null;
  } | null;
  summary: PaymentSummary | null;
}

export interface PaymentSettings {
  depositPercent: number;
  depositDueDays: number;
  balanceDueDaysBeforeArrival: number;
  updatedAt: string | null;
}
