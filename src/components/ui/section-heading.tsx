import { cn } from "@/src/lib/cn";

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
        className={cn(
          "font-display text-[2rem] leading-[1.1] font-medium sm:text-[2.75rem]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-relaxed", tone === "dark" ? "text-white/70" : "text-ink-soft")}>
          {lead}
        </p>
      )}
    </div>
  );
}
