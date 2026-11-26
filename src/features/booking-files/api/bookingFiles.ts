import type {
  BookingFile,
  BookingFileCategory,
  FileLink,
  UploadStart,
} from "../types/bookingFile";

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
    const error = new Error(
      result?.message || "Something went wrong",
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return result as T;
}

const base = (bookingId: string) => `/bookings/${bookingId}/files`;

export const listBookingFiles = (bookingId: string) =>
  send<{ success: boolean; data: BookingFile[] }>("GET", base(bookingId));

export const startUpload = (
  bookingId: string,
  input: {
    fileName: string;
    contentType: string;
    sizeBytes: number;
    category: BookingFileCategory;
    travellerId: string | null;
  },
) =>
  send<{ success: boolean; data: UploadStart }>("POST", base(bookingId), input);

export const completeUpload = (bookingId: string, fileId: string) =>
  send<{ success: boolean; data: BookingFile }>(
    "POST",
    `${base(bookingId)}/${fileId}/complete`,
  );

export const updateBookingFile = (
  bookingId: string,
  fileId: string,
  input: {
    category?: BookingFileCategory;
    travellerId?: string | null;
    fileName?: string;
  },
) =>
  send<{ success: boolean; data: BookingFile }>(
    "PATCH",
    `${base(bookingId)}/${fileId}`,
    input,
  );

export const getFileLink = (
  bookingId: string,
  fileId: string,
  download = false,
) =>
  send<{ success: boolean; data: FileLink }>(
    "GET",
    `${base(bookingId)}/${fileId}/url${download ? "?download=1" : ""}`,
  );

export const deleteBookingFile = (bookingId: string, fileId: string) =>
  send<{ success: boolean }>("DELETE", `${base(bookingId)}/${fileId}`);

/** Guides: a traveller's file on one of their trips. */
export const getMyTripFileLink = (bookingId: string, fileId: string) =>
  send<{ success: boolean; data: FileLink }>(
    "GET",
    `/my-trips/${bookingId}/files/${fileId}/url`,
  );

/**
 * Sends the file straight to S3 with the signed form (it never passes through
 * our server). XHR rather than fetch, for upload progress.
 */
export function postToStorage(
  upload: UploadStart["upload"],
  file: File,
  onProgress: (fraction: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(upload.fields)) form.append(k, v);
    form.append("file", file); // must be last
    const xhr = new XMLHttpRequest();
    xhr.open("POST", upload.url);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new Error(
              `The storage refused the file (${xhr.status}). Please try again.`,
            ),
          );
    xhr.onerror = () =>
      reject(new Error("Upload failed: check your connection and try again."));
    xhr.send(form);
  });
}

/**
 * Opens a file in a new tab. The tab is opened right away (inside the click)
 * so the browser doesn't block it, then pointed at the short-lived link.
 */
export async function openInNewTab(getLink: () => Promise<{ data: FileLink }>) {
  const tab = window.open("", "_blank");
  try {
    const { data } = await getLink();
    if (tab) tab.location.href = data.url;
    else window.location.href = data.url;
  } catch (error) {
    tab?.close();
    throw error;
  }
}
