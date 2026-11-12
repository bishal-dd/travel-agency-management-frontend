type BookingRef = {
  bookingId: string;
  reference: string;
  title: string;
  customerName: string;
};
type Listed<T> = { items: T[]; total: number };

export type QuoteItem = BookingRef & {
  quoteId: string;
  version: number;
  validUntil: string;
  viewCount: number;
  respondedAt: string | null;
  respondedName: string | null;
  /** Only with money access. */
  total?: string;
  currency?: string;
};

export type PaymentDueItem = BookingRef & {
  startDate: string;
  currency: string;
  amount: string;
  label: string | null;
  dueDate: string | null;
};

export type TripItem = BookingRef & {
  status: string;
  startDate: string;
  endDate: string;
  travellers: number;
  paymentStatus:
    | "nothing_due"
    | "unpaid"
    | "partially_paid"
    | "paid"
    | "overpaid"
    | "overdue"
    | null;
  balance?: string;
  currency?: string;
};

export type Counts = {
  inquiries: number;
  confirmed: number;
  departing: number;
  quotesSent: number;
  quotesAccepted: number;
};

export type ActivityType =
  | "quote_sent"
  | "quote_viewed"
  | "quote_accepted"
  | "quote_declined"
  | "booking_created"
  | "booking_confirmed"
  | "payment"
  | "refund";

export interface Activity {
  type: ActivityType;
  at: string;
  bookingId: string;
  reference: string;
  customerName: string;
  detail: string | null;
  amount?: string;
  currency?: string;
}

/** GET /overview — money fields are null without payment access. All money in `currency` (BTN). */
export interface Overview {
  today: string;
  currency: string;
  canSeeMoney: boolean;
  attention: {
    acceptedQuotes: Listed<QuoteItem>;
    expiringQuotes: Listed<QuoteItem>;
    staleInquiries: Listed<
      BookingRef & { createdAt: string; startDate: string }
    >;
    overduePayments: Listed<PaymentDueItem> | null;
    paymentsDueSoon: Listed<PaymentDueItem> | null;
  };
  upcoming: { inCountry: Listed<TripItem>; departing: Listed<TripItem> };
  thisMonth: {
    counts: Counts;
    lastMonth: Counts;
    conversion: number | null;
    conversionLastMonth: number | null;
    money: {
      confirmedValue: string;
      confirmedValueLastMonth: string;
      received: string;
      receivedLastMonth: string;
      profit: string;
      profitLastMonth: string;
      margin: number | null;
      marginLastMonth: number | null;
      outstanding: string;
      overdue: string;
    } | null;
  };
  trend: { month: string; confirmedValue: string; received: string }[] | null;
  activity: Activity[];
  missingExchangeRates: string[];
}
