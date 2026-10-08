import type { ComponentProps, ReactNode } from "react";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

type ButtonProps = ComponentProps<"a"> & {
  variant?: "primary" | "secondary" | "onDark";
  size?: "md" | "lg";
};

const variants = {
  primary:
    "bg-ink text-white hover:bg-lagoon-deep shadow-[0_8px_20px_-8px_rgb(15_34_51/0.6)]",
  secondary:
    "bg-white text-ink ring-1 ring-inset ring-line hover:ring-ink/40",
  onDark: "bg-marigold text-ink hover:bg-white",
};

const sizes = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <a
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function SectionHeading({
  title,
  lead,
  align = "left",
  tone = "light",
}: {
  title: string;
  lead?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2
        className={`font-display text-[2rem] leading-[1.1] font-medium sm:text-[2.75rem] ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            tone === "dark" ? "text-white/70" : "text-ink-soft"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <a href="#top" className="inline-flex items-center gap-2.5" aria-label="Tripdesk home">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
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
      <span
        className={`font-display text-[1.35rem] font-semibold ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        Tripdesk
      </span>
    </a>
  );
}
