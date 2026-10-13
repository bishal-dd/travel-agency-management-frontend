import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/src/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-2xl bg-white ring-1 ring-line", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
