/** ISO calendar date, "YYYY-MM-DD". */
export type IsoDate = string;

export const TRIP_STATUSES = [
  "planning",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export type Passport = {
  number: string;
  /** Issuing country as printed on the passport, e.g. "BTN". */
  issuingCountry: string;
  issueDate?: IsoDate;
  expiryDate: IsoDate;
};

export type Traveller = {
  id: string;
  fullName: string;
  dateOfBirth?: IsoDate;
  nationality: string;
  email?: string;
  phone?: string;
  passport: Passport;
};

export type Trip = {
  id: string;
  organizationId: string;
  title: string;
  destination: string;
  startDate: IsoDate;
  endDate: IsoDate;
  status: TripStatus;
  notes?: string;
  travellers: Traveller[];
  createdAt: string;
  updatedAt: string;
};

export type TravellerInput = Omit<Traveller, "id">;

export type TripInput = {
  title: string;
  destination: string;
  startDate: IsoDate;
  endDate: IsoDate;
  status: TripStatus;
  notes?: string;
  travellers: TravellerInput[];
};

export type PassportStatus =
  | "valid"
  | "short-validity"
  | "expires-before-return";
