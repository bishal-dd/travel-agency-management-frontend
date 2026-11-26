"use client";

import { useState } from "react";
import {
  Clock,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";

const SEEN_KEY = "hmt:filesPrivacyNoticeSeen";

/** Has this browser already chosen "Don't show this again"? */
export function privacyNoticeSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false; // storage blocked: just show it
  }
}

const POINTS = [
  {
    icon: Lock,
    title: "Stored privately and encrypted",
    body: "Files go into private storage and are encrypted there (AES-256). They're never public on the internet.",
  },
  {
    icon: KeyRound,
    title: "Only your team can open them",
    body: "In HMT, only people in your agency who can see this booking. Guides see only travellers' files on trips assigned to them.",
  },
  {
    icon: Clock,
    title: "Links expire after 5 minutes",
    body: "Each time someone opens a file, HMT makes a fresh link. A forwarded link stops working.",
  },
  {
    icon: ShieldCheck,
    title: "Sent over a secure connection",
    body: "Uploads and downloads use HTTPS, so nobody in between can read them.",
  },
  {
    icon: Trash2,
    title: "Delete anytime",
    body: "Deleting a file removes it from storage for good.",
  },
];

/**
 * Shown before choosing a file to upload: passports and visas are sensitive,
 * so say plainly how they're kept. "Choose file" opens the file picker.
 */
export function FilesPrivacyNotice({
  open,
  onClose,
  onContinue,
}: {
  open: boolean;
  onClose: () => void;
  /** Called from the button's click, so the file picker is allowed to open. */
  onContinue: () => void;
}) {
  const [dontShow, setDontShow] = useState(false);

  function proceed() {
    if (dontShow) {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        // not critical
      }
    }
    onContinue();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Your files are kept safe"
      description="Passports and other documents are sensitive. Here's how HMT looks after them."
    >
      <div className="space-y-4 overflow-y-auto px-6 py-6">
        <ul className="space-y-3.5">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full bg-lagoon/10 text-lagoon-deep"
                aria-hidden="true"
              >
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-soft">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-start gap-2 rounded-xl bg-mist/60 px-3.5 py-2.5 text-xs text-ink-soft">
          <EyeOff size={14} aria-hidden="true" className="mt-px shrink-0" />
          Upload only what the trip needs (passport, visa, permits), and delete
          documents you no longer need after the trip.
        </p>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="size-4 accent-lagoon-deep"
          />
          Don&apos;t show this again
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={proceed}
          autoFocus
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
        >
          Choose file
        </button>
      </div>
    </Modal>
  );
}
