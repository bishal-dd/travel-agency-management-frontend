"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCan } from "@/src/lib/useCan";
import { getFileLink, openInNewTab } from "../api/bookingFiles";
import {
  useBookingFiles,
  useDeleteBookingFile,
  useUpdateBookingFile,
  useUploadBookingFiles,
  type UploadingFile,
} from "../hooks/useBookingFiles";
import {
  FILE_ACCEPT,
  FILE_CATEGORIES,
  categoryLabel,
  formatBytes,
  type BookingFile,
  type BookingFileCategory,
} from "../types/bookingFile";
import { FilesPrivacyNotice, privacyNoticeSeen } from "./FilesPrivacyNotice";

type Traveller = { id: string; name: string; isLead?: boolean };
type Target = { travellerId: string | null; category: BookingFileCategory };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Thimphu",
  });

function FileIcon({ type }: { type: string }) {
  const Icon = type.startsWith("image/") ? ImageIcon : FileText;
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-ink-soft"
      aria-hidden="true"
    >
      <Icon size={16} />
    </span>
  );
}

function FileRow({
  file,
  bookingId,
  canEdit,
  canDelete,
}: {
  file: BookingFile;
  bookingId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const update = useUpdateBookingFile(bookingId);
  const remove = useDeleteBookingFile(bookingId);
  const [confirming, setConfirming] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const open = (download: boolean) => {
    setOpenError(null);
    openInNewTab(() => getFileLink(bookingId, file.id, download)).catch(
      (e: Error) => setOpenError(e.message),
    );
  };

  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5">
      <FileIcon type={file.contentType} />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => open(false)}
          className="block max-w-full truncate text-left text-sm font-medium text-ink hover:text-lagoon-deep"
        >
          {file.fileName}
        </button>
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-soft">
          {canEdit ? (
            <select
              aria-label={`Type of ${file.fileName}`}
              value={file.category}
              disabled={update.isPending}
              onChange={(e) =>
                update.mutate({
                  fileId: file.id,
                  category: e.target.value as BookingFileCategory,
                })
              }
              className="-ml-1 rounded bg-transparent px-1 py-0.5 text-xs text-ink-soft hover:bg-mist focus:bg-mist"
            >
              {FILE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <span>{categoryLabel(file.category)}</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatBytes(file.sizeBytes)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {fmtDate(file.createdAt)}
            {file.uploadedBy ? ` by ${file.uploadedBy}` : ""}
          </span>
        </p>
        {(openError || remove.error) && (
          <p className="text-xs text-red-700">
            {openError ?? remove.error?.message}
          </p>
        )}
      </div>

      {confirming ? (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-ink-soft">Delete for good?</span>
          <button
            type="button"
            onClick={() => remove.mutate(file.id)}
            disabled={remove.isPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {remove.isPending && <Loader2 size={13} className="animate-spin" />}
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-8 rounded-full px-3 font-semibold text-ink hover:bg-mist"
          >
            Keep
          </button>
        </div>
      ) : (
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => open(false)}
            aria-label={`View ${file.fileName}`}
            title="View"
            className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => open(true)}
            aria-label={`Download ${file.fileName}`}
            title="Download"
            className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
          >
            <Download size={15} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${file.fileName}`}
              title="Delete"
              className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function UploadingRow({
  u,
  onDismiss,
}: {
  u: UploadingFile;
  onDismiss: () => void;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-ink-soft"
        aria-hidden="true"
      >
        {u.error ? (
          <AlertCircle size={16} className="text-red-600" />
        ) : (
          <Loader2 size={16} className="animate-spin" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{u.fileName}</p>
        {u.error ? (
          <p className="text-xs text-red-700">{u.error}</p>
        ) : (
          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist"
            role="progressbar"
            aria-valuenow={Math.round(u.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Uploading ${u.fileName}`}
          >
            <div
              className="h-full rounded-full bg-lagoon transition-[width]"
              style={{ width: `${Math.max(4, u.progress * 100)}%` }}
            />
          </div>
        )}
      </div>
      {u.error && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-mist"
        >
          <X size={15} />
        </button>
      )}
    </li>
  );
}

function Group({
  title,
  hint,
  files,
  uploading,
  bookingId,
  canUpload,
  canEdit,
  canDelete,
  onUpload,
  onDismiss,
}: {
  title: string;
  hint?: string;
  files: BookingFile[];
  uploading: UploadingFile[];
  bookingId: string;
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onUpload: () => void;
  onDismiss: (key: string) => void;
}) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        </div>
        {canUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
          >
            <Upload size={14} aria-hidden="true" /> Add file
          </button>
        )}
      </div>
      {files.length + uploading.length > 0 ? (
        <ul className="mt-1 divide-y divide-line">
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              bookingId={bookingId}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
          {uploading.map((u) => (
            <UploadingRow
              key={u.key}
              u={u}
              onDismiss={() => onDismiss(u.key)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-ink-soft">No files yet.</p>
      )}
    </div>
  );
}

/**
 * Documents on a booking: each traveller's passport, visa, photo… and files
 * for the whole booking (tickets, permits). Put it on the booking page:
 *   <BookingFilesPanel bookingId={booking.id} travellers={booking.travellers} />
 */
export function BookingFilesPanel({
  bookingId,
  travellers,
}: {
  bookingId: string;
  travellers: Traveller[];
}) {
  const { can, ready } = useCan();
  const canRead = ready && can({ guest: ["read"] });
  const canUpload = ready && can({ guest: ["create"] });
  const canEdit = ready && can({ guest: ["update"] });
  const canDelete = ready && can({ guest: ["delete"] });

  const { data: files, isPending, error } = useBookingFiles(bookingId);
  const { uploads, upload, dismiss } = useUploadBookingFiles(bookingId);
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);

  if (ready && !canRead) return null;

  /** "Add file": show the privacy notice first (unless dismissed for good), then the file picker. */
  function startUpload(t: Target) {
    setTarget(t);
    if (privacyNoticeSeen()) input.current?.click();
    else setNoticeOpen(true);
  }

  const forTraveller = (id: string | null) =>
    (files ?? []).filter((f) => f.travellerId === id);
  const uploadingFor = (id: string | null) =>
    uploads.filter((u) => u.travellerId === id);

  return (
    <section
      aria-labelledby="booking-files-h"
      className="rounded-2xl border border-line bg-white"
    >
      <div className="border-b border-line px-5 py-4">
        <h2 id="booking-files-h" className="font-semibold text-ink">
          Documents
        </h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
          <Lock size={12} aria-hidden="true" /> Private and encrypted. Only your
          team can open them. PDF or photo, up to 10 MB.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-2 p-5" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-mist/70" />
          ))}
        </div>
      ) : error ? (
        <p className="px-5 py-6 text-sm text-red-700">
          Couldn&apos;t load the documents: {error.message}
        </p>
      ) : (
        <div className="divide-y divide-line">
          {travellers.map((t) => (
            <Group
              key={t.id}
              title={t.name}
              hint={t.isLead ? "Lead traveller" : undefined}
              files={forTraveller(t.id)}
              uploading={uploadingFor(t.id)}
              bookingId={bookingId}
              canUpload={canUpload}
              canEdit={canEdit}
              canDelete={canDelete}
              onUpload={() =>
                startUpload({ travellerId: t.id, category: "passport" })
              }
              onDismiss={dismiss}
            />
          ))}
          <Group
            title="Booking documents"
            hint="Tickets, permits, insurance… for the whole trip"
            files={forTraveller(null)}
            uploading={uploadingFor(null)}
            bookingId={bookingId}
            canUpload={canUpload}
            canEdit={canEdit}
            canDelete={canDelete}
            onUpload={() =>
              startUpload({ travellerId: null, category: "other" })
            }
            onDismiss={dismiss}
          />
          {travellers.length === 0 && (
            <p className="px-5 py-3 text-xs text-ink-soft">
              Add travellers to the booking to upload their passports and visas.
            </p>
          )}
        </div>
      )}

      <input
        ref={input}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const chosen = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (chosen.length && target) void upload(chosen, target);
        }}
      />

      <FilesPrivacyNotice
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        onContinue={() => {
          setNoticeOpen(false);
          input.current?.click();
        }}
      />
    </section>
  );
}
