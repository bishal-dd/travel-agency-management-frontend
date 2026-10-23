import Link from "next/link";
import { Container, Logo } from "./ui";

const columns = [
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs leading-relaxed text-ink-soft">
            The management platform for travel agencies that would rather plan
            trips than paperwork.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:justify-items-end">
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="text-sm font-bold">{c.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Help Make Travel. All rights reserved.</p>
          <p>Made for agencies everywhere.</p>
        </Container>
      </div>
    </footer>
  );
}
