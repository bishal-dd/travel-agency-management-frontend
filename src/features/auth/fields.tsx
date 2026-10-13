"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { CircleAlert, Eye, EyeOff, Info } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-xl bg-white px-4 text-[15px] text-ink ring-1 ring-inset ring-line transition-shadow placeholder:text-ink-soft/60 hover:ring-ink/30 focus:ring-2 focus:ring-lagoon focus:outline-none aria-[invalid=true]:ring-red-600";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  labelAside?: ReactNode;
};

export function Field({
  label,
  error,
  hint,
  labelAside,
  type = "text",
  ...props
}: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative mt-2">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} ${isPassword ? "pr-12" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-1 right-1 grid size-10 place-items-center rounded-lg text-ink-soft hover:text-ink"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-center gap-1.5 text-sm text-red-700"
        >
          <CircleAlert size={14} className="shrink-0" /> {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 text-sm text-ink-soft">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function Checkbox({
  children,
  error,
  ...props
}: ComponentProps<"input"> & { children: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-[18px] shrink-0 rounded accent-lagoon"
          {...props}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-ink-soft">
          {children}
        </label>
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-700">
          <CircleAlert size={14} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(15_34_51/0.6)] transition-colors duration-200 hover:bg-lagoon-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Shown after a valid submit, since no auth backend is connected yet. */
export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex gap-2.5 rounded-xl bg-lagoon-tint p-3.5 text-sm text-lagoon-deep"
    >
      <Info size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
