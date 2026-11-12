/** GET /pricing-settings — the agency's tax and government-fee rules. */
export interface PricingSettings {
  gstRegistered: boolean;
  /** Percent, "5.00" */
  gstRate: string;
  /** true = rates already include GST; false = GST is added on top. */
  gstInclusive: boolean;

  sdfAmount: string;
  sdfCurrency: string;
  sdfRegionalAmount: string;
  sdfRegionalCurrency: string;
  regionalNationalities: string[];
  sdfChildPercent: number;
  sdfChildUnderAge: number;
  sdfFreeUnderAge: number;

  visaAmount: string;
  visaCurrency: string;
  visaExemptNationalities: string[];

  exemptNationalities: string[];
  /** null until the agency saves its own (defaults apply). */
  updatedAt: string | null;
}

export type PricingSettingsInput = Partial<Omit<PricingSettings, "updatedAt">>;

export interface PricingSettingsResponse {
  success: boolean;
  message?: string;
  data: PricingSettings;
}
