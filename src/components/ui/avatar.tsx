import { cn } from "@/src/lib/cn";
import { initialsOf } from "@/src/lib/format";

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;
const tones = {
  marigold: "bg-marigold text-ink",
  lagoon: "bg-lagoon text-white",
  tint: "bg-lagoon-tint text-lagoon-deep",
  ink: "bg-ink text-white",
} as const;

export function Avatar({
  name,
  size = "md",
  tone = "tint",
  shape = "circle",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  shape?: "circle" | "square";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center font-bold select-none",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
