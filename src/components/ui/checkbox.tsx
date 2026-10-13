"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { FieldMessage } from "./input";

export function Checkbox({
  children,
  error,
  id,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { children: ReactNode; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-[18px] shrink-0 rounded accent-lagoon"
          {...props}
        />
        <label htmlFor={inputId} className="text-sm leading-relaxed text-ink-soft">
          {children}
        </label>
      </div>
      {error && <FieldMessage tone="error">{error}</FieldMessage>}
    </div>
  );
}
