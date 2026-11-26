export type BookingFileCategory =
  | "passport"
  | "visa"
  | "photo"
  | "ticket"
  | "permit"
  | "insurance"
  | "other";

export const FILE_CATEGORIES: { value: BookingFileCategory; label: string }[] =
  [
    { value: "passport", label: "Passport / CID" },
    { value: "visa", label: "Visa" },
    { value: "photo", label: "Photo" },
    { value: "ticket", label: "Ticket" },
    { value: "permit", label: "Permit" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other" },
  ];
export const categoryLabel = (c: BookingFileCategory) =>
  FILE_CATEGORIES.find((x) => x.value === c)?.label ?? c;

/** Same limits as the server. */
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const FILE_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export interface BookingFile {
  id: string;
  bookingId: string;
  /** null = a file for the whole booking. */
  travellerId: string | null;
  category: BookingFileCategory;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string | null;
  createdAt: string;
}

export interface UploadStart {
  file: BookingFile;
  upload: { url: string; fields: Record<string, string>; expiresIn: number };
}

export interface FileLink {
  url: string;
  expiresIn: number;
}

/** "245 KB", "1.2 MB" */
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Browsers sometimes leave the type empty (e.g. HEIC); guess from the name. */
export function fileType(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "pdf"
    ? "application/pdf"
    : ext === "heic"
      ? "image/heic"
      : ext === "heif"
        ? "image/heif"
        : "";
}
