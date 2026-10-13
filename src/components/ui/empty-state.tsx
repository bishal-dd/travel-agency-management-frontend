import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 text-center", compact ? "py-8" : "py-14")}>
      <span className="grid size-12 place-items-center rounded-2xl bg-lagoon-tint text-lagoon-deep">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="mt-4 font-bold">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
