/** Stored status; "expired" is worked out from validUntil. */
export type QuoteStatus =
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "superseded"
  | "revoked"
  | "expired";

/** What the customer's quote page shows (customer-safe; no costs or ids). */
export interface QuoteSnapshot {
  agency: { name: string; logo: string | null };
  reference: string;
  title: string;
  startDate: string;
  endDate: string;
  nights: number;
  adults: number;
  children: number;
  customerName: string;
  travellers: string[];
  message: string | null;
  showDayPrices: boolean;
  days: {
    dayNumber: number;
    date: string;
    title: string;
    description: string | null;
    destination: string | null;
    activities: string[];
    meals: string[];
    overnightLocation: string | null;
    hotel: string | null;
    transport: boolean;
    guide: boolean;
    extras: string[];
    price: string | null;
  }[];
  inclusions: string[];
  exclusions: string[];
  pricing: {
    currency: string;
    tripPrice: string;
    gst: { rate: string; inclusive: boolean; amount: string } | null;
    sdf: string;
    visa: string;
    governmentFees: string;
    total: string;
    feeLines:
      | {
          description: string;
          quantity: number;
          unitAmount: string;
          currency: string;
          amount: string;
        }[]
      | null;
  };
  validUntil: string;
  terms: {
    payment: string | null;
    cancellation: string | null;
    footer: string | null;
  };
}

/** A quote as the agent sees it. */
export interface Quote {
  id: string;
  bookingId: string;
  version: number;
  token: string;
  /** "/q/<token>": add window.location.origin for the full link. */
  path: string;
  status: Exclude<QuoteStatus, "expired">;
  effectiveStatus: QuoteStatus;
  currency: string;
  total: string;
  validUntil: string;
  viewCount: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  respondedAt: string | null;
  respondedName: string | null;
  responseMessage: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  /** Only on create and GET /quotes/:id. */
  snapshot?: QuoteSnapshot;
}

export interface CreateQuoteInput {
  message?: string | null;
  validUntil?: string;
  showDayPrices?: boolean;
  inclusions?: string[];
  exclusions?: string[];
}

export interface QuoteResponse {
  success: boolean;
  message?: string;
  data: Quote;
}
export interface QuotesResponse {
  success: boolean;
  data: Quote[];
}

/** GET /public/quotes/:token */
export interface PublicQuote {
  version: number;
  status: QuoteStatus;
  isLatest: boolean;
  canRespond: boolean;
  validUntil: string;
  sentAt: string;
  respondedAt: string | null;
  respondedName: string | null;
  snapshot: QuoteSnapshot;
}

export interface QuoteSettings {
  validityDays: number;
  showDayPrices: boolean;
  showFeeBreakdown: boolean;
  paymentTerms: string | null;
  cancellationPolicy: string | null;
  footerNote: string | null;
  updatedAt: string | null;
}
export type QuoteSettingsInput = Partial<Omit<QuoteSettings, "updatedAt">>;
export interface QuoteSettingsResponse {
  success: boolean;
  message?: string;
  data: QuoteSettings;
}
