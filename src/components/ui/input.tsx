import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, CircleAlert } from "lucide-react";
import { cn } from "@/src/lib/cn";

export const controlClassName =
  "h-11 w-full rounded-xl bg-white px-3.5 text-[15px] text-ink ring-1 ring-line transition-shadow ring-inset placeholder:text-ink-soft/60 hover:ring-ink/30 focus:ring-2 focus:ring-lagoon focus:outline-none disabled:cursor-not-allowed disabled:bg-mist disabled:opacity-70 aria-[invalid=true]:ring-red-600";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-ink", className)} {...props} />;
}

export function Input({
  icon: Icon,
  className,
  ...props
}: ComponentProps<"input"> & { icon?: LucideIcon }) {
  if (!Icon) return <input className={cn(controlClassName, className)} {...props} />;
  return (
    <div className="relative">
      <Icon
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft"
      />
      <input className={cn(controlClassName, "pl-10", className)} {...props} />
    </div>
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(controlClassName, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

export function FieldMessage({
  id,
  tone = "hint",
  children,
}: {
  id?: string;
  tone?: "hint" | "error";
  children: ReactNode;
}) {
  if (tone === "error") {
    return (
      <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-red-700">
        <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </p>
    );
  }
  return (
    <p id={id} className="mt-2 text-sm text-ink-soft">
      {children}
    </p>
  );
}
