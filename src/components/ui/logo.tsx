import Link from "next/link";
import { cn } from "@/src/lib/cn";
import { routes } from "@/src/config/routes";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" className={className}>
      <rect width="30" height="30" rx="9" className="fill-lagoon" />
      <path
        d="M8 20c3-9 7 1 9-5s4-5 5-5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.1 4"
      />
      <circle cx="8" cy="20" r="2.4" className="fill-marigold" />
      <circle cx="22" cy="10" r="2.4" fill="white" />
    </svg>
  );
}

export function Logo({ tone = "light", href = routes.home }: { tone?: "light" | "dark"; href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Tripdesk home">
      <LogoMark />
      <span
        className={cn("font-display text-[1.35rem] font-semibold", tone === "dark" ? "text-white" : "text-ink")}
      >
        Tripdesk
      </span>
    </Link>
  );
}
