import type { PaymentMethod } from "../../payments/types/payment";

/** Who the agency paid. */
export type SupplierType =
  | "hotel"
  | "guide"
  | "vehicle"
  | "service"
  | "government"
  | "other";
/** Types you pick from your lists (the others are typed in). */
export type ListedSupplierType = "hotel" | "guide" | "vehicle" | "service";

export const SUPPLIER_TYPES: {
  value: SupplierType;
  label: string;
  plural: string;
}[] = [
  { value: "hotel", label: "Hotel", plural: "Hotels" },
  { value: "guide", label: "Guide", plural: "Guides" },
  { value: "vehicle", label: "Vehicle / driver", plural: "Transport" },
  { value: "service", label: "Service", plural: "Services" },
  { value: "government", label: "Government", plural: "SDF & visa fees" },
  { value: "other", label: "Other", plural: "Other" },
];
export const supplierLabel = (t: SupplierType) =>
  SUPPLIER_TYPES.find((x) => x.value === t)?.label ?? t;
export const categoryLabel = (t: SupplierType) =>
  SUPPLIER_TYPES.find((x) => x.value === t)?.plural ?? t;
export const isListed = (t: SupplierType): t is ListedSupplierType =>
  t === "hotel" || t === "guide" || t === "vehicle" || t === "service";

export interface Period {
  /** YYYY-MM-DD, both included */
  from: string;
  to: string;
}

/** All amounts are BTN, as "1234.50". */
export interface AccountsSummary {
  currency: "BTN";
  period: Period;
  cash: {
    in: string;
    out: string;
    net: string;
    paidToSuppliers: string;
    refunds: string;
    customerPayments: number;
  };
  trips: {
    count: number;
    /** Without GST. */
    revenue: string;
    cost: string;
    profit: string;
    margin: number | null;
    governmentFees: string;
  };
  stillToPay: string;
  categories: { type: SupplierType; cost: string; paid: string }[];
  suppliers: AccountSupplier[];
  missingRates: string[];
}

export interface AccountSupplier {
  key: string;
  type: SupplierType;
  id: string | null;
  name: string;
  /** Booking costs of trips starting in the period. */
  cost: string;
  /** Paid in the period. */
  paid: string;
  /** Costs up to the period end minus payments up to then. null = not tracked (e.g. office rent). */
  owed: string | null;
}

export type TransactionCategory = SupplierType | "customer" | "refund";

export interface Transaction {
  id: string;
  source: "customer" | "supplier";
  direction: "in" | "out";
  category: TransactionCategory;
  date: string;
  description: string;
  detail: string | null;
  method: PaymentMethod;
  amount: string;
  currency: string;
  btnAmount: string;
  booking: { id: string; reference: string } | null;
  reference: string | null;
  notes: string | null;
  voided: boolean;
  voidReason: string | null;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  period: Period;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  missingRates: string[];
}

export interface RecordSupplierPaymentInput {
  supplierType: SupplierType;
  supplierId?: string | null;
  payeeName?: string | null;
  bookingId?: string | null;
  method: PaymentMethod;
  amount: string;
  currency: string;
  btnRate?: string;
  paidOn: string;
  reference?: string | null;
  notes?: string | null;
}

export interface Payee {
  id: string;
  name: string;
  detail: string | null;
}

export interface BookingOption {
  id: string;
  reference: string;
  title: string;
  startDate: string;
}
