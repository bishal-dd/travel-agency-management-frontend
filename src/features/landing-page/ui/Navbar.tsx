"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button, Container, Logo } from "./ui";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#product", label: "Product" },
  { href: "/#benefits", label: "Why Help Make Travel" },
  { href: "/#how-it-works", label: "How it works" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setOpen(false);

    if (pathname !== "/") return;

    const id = href.split("#")[1];
    const el = id ? document.getElementById(id) : null;

    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop authentication actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/sign-in" variant="secondary">
            Sign in
          </Button>

          <Button href="/sign-up">Sign up</Button>
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

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 lg:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0" inert={!open}>
          <Container className="flex flex-col pb-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="border-b border-line py-3.5 text-base font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile authentication actions */}
            <div className="mt-5 flex flex-col gap-3">
              <Button
                href="/sign-in"
                variant="secondary"
                size="lg"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Button>

              <Button href="/sign-up" size="lg" onClick={() => setOpen(false)}>
                Sign up
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
