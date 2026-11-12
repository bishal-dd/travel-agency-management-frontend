/** "1 <currency> = btnPerUnit BTN". BTN itself is always 1 and isn't listed. */
export interface ExchangeRate {
  currency: string;
  btnPerUnit: string; // "85.000000"
  updatedAt: string;
}

export interface ExchangeRatesResponse {
  success: boolean;
  message?: string;
  data: ExchangeRate[];
}

export interface ExchangeRateInput {
  currency: string;
  btnPerUnit: string | number;
}
