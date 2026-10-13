import type { ReactNode } from "react";
import { cn } from "@/src/lib/cn";

const tones = {
  neutral: "bg-mist text-ink-soft",
  lagoon: "bg-lagoon-tint text-lagoon-deep",
  marigold: "bg-marigold-tint text-ink",
  ink: "bg-ink text-white",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
