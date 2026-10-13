import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/src/lib/cn";

const variants = {
  primary: "bg-ink text-white shadow-[0_8px_20px_-8px_rgb(15_34_51/0.6)] hover:bg-lagoon-deep",
  secondary: "bg-white text-ink ring-1 ring-line ring-inset hover:ring-ink/40",
  ghost: "text-ink-soft hover:bg-mist hover:text-ink",
  accent: "bg-marigold text-ink hover:bg-white",
  outlineOnDark: "text-white ring-1 ring-white/25 ring-inset hover:bg-white/10",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "size-10",
} as const;

export type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleProps & { className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={buttonClassName({ variant, size, className })} {...props} />;
}
