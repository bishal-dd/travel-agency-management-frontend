"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/src/lib/cn";
import { FieldMessage, Input, Label } from "./input";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  labelAside?: ReactNode;
};

/** Label, input and message wired together with ids for screen readers. */
export function TextField({ label, error, hint, icon, labelAside, type = "text", id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={inputId}>{label}</Label>
        {labelAside}
      </div>
      <div className="relative mt-2">
        <Input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          icon={icon}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(isPassword && "pr-12")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-soft hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <FieldMessage id={messageId} tone="error">
          {error}
        </FieldMessage>
      ) : (
        hint && <FieldMessage id={messageId}>{hint}</FieldMessage>
      )}
    </div>
  );
}
