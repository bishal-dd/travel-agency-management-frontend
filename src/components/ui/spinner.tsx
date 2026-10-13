import { LoaderCircle } from "lucide-react";
import { cn } from "@/src/lib/cn";

export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-ink-soft", className)}>
      <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-mist", className)} />;
}
