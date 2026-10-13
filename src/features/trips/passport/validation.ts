import type { IsoDate, TravellerInput } from "./types";

export type TripFieldErrors = Partial<
  Record<"title" | "destination" | "startDate" | "endDate", string>
>;

export type TravellerDraft = {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
  phone: string;
  passportNumber: string;
  issuingCountry: string;
  passportIssueDate: string;
  passportExpiry: string;
};

export type TravellerField = keyof TravellerDraft;
export type TravellerErrors = Partial<Record<TravellerField, string>>;

export const emptyTravellerDraft: TravellerDraft = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  email: "",
  phone: "",
  passportNumber: "",
  issuingCountry: "",
  passportIssueDate: "",
  passportExpiry: "",
};

const PASSPORT_NUMBER = /^[A-Z0-9]{5,20}$/;
const COUNTRY = /^[A-Za-z][A-Za-z .'-]{1,59}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalisePassportNumber(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function validateTrip(values: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
}): TripFieldErrors {
  const errors: TripFieldErrors = {};
  if (!values.title.trim()) errors.title = "Enter a trip name.";
  if (!values.destination.trim()) errors.destination = "Enter a destination.";
  if (!values.startDate) errors.startDate = "Choose a start date.";
  if (!values.endDate) errors.endDate = "Choose an end date.";
  else if (values.startDate && values.endDate < values.startDate) {
    errors.endDate = "End date can't be before the start date.";
  }
  return errors;
}

/** `today` is passed in so validation stays a pure function. */
export function validateTraveller(
  draft: TravellerDraft,
  today: IsoDate,
): TravellerErrors {
  const errors: TravellerErrors = {};
  const passportNumber = normalisePassportNumber(draft.passportNumber);

  if (!draft.fullName.trim())
    errors.fullName = "Enter the name as shown on the passport.";
  if (!draft.nationality.trim()) errors.nationality = "Enter the nationality.";
  else if (!COUNTRY.test(draft.nationality.trim()))
    errors.nationality = "Use letters only, e.g. Bhutanese or BTN.";
  if (draft.dateOfBirth && draft.dateOfBirth >= today)
    errors.dateOfBirth = "Date of birth must be in the past.";
  if (draft.email.trim() && !EMAIL.test(draft.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!passportNumber) errors.passportNumber = "Enter the passport number.";
  else if (!PASSPORT_NUMBER.test(passportNumber)) {
    errors.passportNumber = "Use 5 to 20 letters and numbers.";
  }
  if (!draft.issuingCountry.trim())
    errors.issuingCountry = "Enter the issuing country.";
  else if (!COUNTRY.test(draft.issuingCountry.trim()))
    errors.issuingCountry = "Use letters only, e.g. BTN.";
  if (!draft.passportExpiry) errors.passportExpiry = "Enter the expiry date.";
  if (draft.passportIssueDate) {
    if (draft.passportIssueDate > today)
      errors.passportIssueDate = "Issue date can't be in the future.";
    else if (
      draft.passportExpiry &&
      draft.passportExpiry <= draft.passportIssueDate
    ) {
      errors.passportExpiry = "Expiry must be after the issue date.";
    }
  }
  return errors;
}

export function hasErrors(errors: object) {
  return Object.keys(errors).length > 0;
}

export function draftToTraveller(draft: TravellerDraft): TravellerInput {
  const optional = (value: string) => value.trim() || undefined;
  return {
    fullName: draft.fullName.trim(),
    dateOfBirth: optional(draft.dateOfBirth),
    nationality: draft.nationality.trim(),
    email: optional(draft.email),
    phone: optional(draft.phone),
    passport: {
      number: normalisePassportNumber(draft.passportNumber),
      issuingCountry: draft.issuingCountry.trim().toUpperCase(),
      issueDate: optional(draft.passportIssueDate),
      expiryDate: draft.passportExpiry,
    },
  };
}

/** Today's date as "YYYY-MM-DD" in the user's time zone. Call from event handlers. */
export function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
