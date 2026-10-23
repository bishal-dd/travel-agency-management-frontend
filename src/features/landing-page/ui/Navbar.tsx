"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button, Container, Logo } from "./ui";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#product", label: "Product" },
  { href: "/#benefits", label: "Why Help Make Travel" },
  { href: "/#how-it-works", label: "How it works" },
  // { href: "#customers", label: "Customers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        solid
          ? "bg-paper/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <Container className="relative flex h-16 items-center justify-between">
        <Logo />
        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        {/* <div className="hidden items-center gap-2 lg:flex">
          <a
            href="/sign-in"
            className="px-3 text-sm font-semibold text-ink transition-colors hover:text-lagoon"
          >
            Sign in
          </a>

          <Button href="/sign-up">Start free trial</Button>
        </div> */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/waitlist">Join the waitlist</Button>
        </div>
        <button
          type="button"
          className="-mr-2 grid size-10 place-items-center rounded-full text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <div
        id="mobile-menu"
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 lg:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0" inert={!open}>
          <Container className="flex flex-col pb-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-base font-medium text-ink"
              >
                {l.label}
              </a>
            ))}
            {/* <div className="mt-5 grid grid-cols-2 gap-3">
              <Button href="#" variant="secondary" size="lg">
                Sign in
              </Button>
              <Button
                href="#get-started"
                size="lg"
                onClick={() => setOpen(false)}
              >
                Start free trial
              </Button>
            </div> */}
            <div className="mt-5">
              <Button href="/waitlist" size="lg" onClick={() => setOpen(false)}>
                Join the waitlist
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
