import { Star } from "lucide-react";

type Status = "active" | "inactive";

export function StatusBadge({ status }: { status: Status }) {
  const on = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        on ? "bg-lagoon-tint text-lagoon-deep" : "bg-mist text-ink-soft"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${on ? "bg-lagoon-deep" : "bg-ink-soft/50"}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export function StarRatingDisplay({ value }: { value: number | null }) {
  if (!value) return <span className="text-sm text-ink-soft">—</span>;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} star`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          aria-hidden="true"
          className={i < value ? "fill-marigold text-marigold" : "text-line"}
        />
      ))}
    </span>
  );
}
