"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  CalendarCheck,
  Compass,
  FileText,
  Hotel,
  IdCard,
  Loader2,
  Route,
  Search,
  Ticket,
  User,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import {
  GROUP_LABEL,
  LIST_SEARCH_EVENT,
  hrefFor,
  type SearchGroupType,
  type SearchItem,
} from "../types/search";

const ICON: Record<SearchGroupType, LucideIcon> = {
  booking: CalendarCheck,
  traveller: User,
  customer: UsersRound,
  document: FileText,
  hotel: Hotel,
  guide: Compass,
  driver: IdCard,
  vehicle: Bus,
  itinerary: Route,
  service: Ticket,
};

/** Wait until typing pauses before searching. */
function useDebounced(value: string, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * The search box in the header. Results appear as you type, grouped by kind
 * (only what your role can see). "/" focuses it; arrows move, Enter opens,
 * Esc closes.
 */
export function HeaderSearch() {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const term = useDebounced(text.trim());
  const { data, isFetching, error } = useSearch(term);
  const ready = term.length >= 2;

  /** All results in display order, for the arrow keys. */
  const flat = useMemo(
    () =>
      (data ?? []).flatMap((g) =>
        g.items.map((item) => ({
          type: g.type,
          item,
          href: hrefFor(g.type, item),
        })),
      ),
    [data],
  );
  useEffect(() => setActive(0), [data]);

  // "/" anywhere (outside a text field) jumps to search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const typing =
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) =>
      !boxRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setText("");
    inputRef.current?.blur();
    router.push(href);
    // List pages fill their search box from ?q=; tell one that's already open.
    const q = new URL(href, window.location.origin).searchParams.get("q");
    if (q)
      window.dispatchEvent(new CustomEvent(LIST_SEARCH_EVENT, { detail: q }));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (text) setText("");
      else inputRef.current?.blur();
      setOpen(false);
      return;
    }
    if (!flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[active];
      if (target) go(target.href);
    }
  }

  const showPanel = open && text.trim().length > 0;
  const optionId = (i: number) => `${listId}-opt-${i}`;
  let index = -1;

  return (
    <div
      ref={boxRef}
      role="search"
      className="relative min-w-0 flex-1 sm:max-w-sm lg:ml-12"
    >
      <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30">
        {isFetching && ready ? (
          <Loader2
            size={14}
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
        ) : (
          <Search size={14} aria-hidden="true" className="shrink-0" />
        )}
        <span className="sr-only">Search</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && flat.length ? optionId(active) : undefined
          }
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search bookings, customers, passports…"
          autoComplete="off"
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
        />
        <kbd className="hidden rounded border border-line bg-white px-1.5 text-[10px] font-semibold sm:inline">
          /
        </kbd>
      </label>

      {showPanel && (
        <div className="fixed inset-x-2 top-[3.75rem] z-40 max-h-[70dvh] overflow-y-auto rounded-2xl border border-line bg-white py-2 shadow-lg sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[30rem]">
          {!ready ? (
            <p className="px-4 py-3 text-sm text-ink-soft">Keep typing…</p>
          ) : error ? (
            <p className="px-4 py-3 text-sm text-red-700">
              Search isn&apos;t working right now. Try again in a moment.
            </p>
          ) : data && flat.length === 0 && !isFetching ? (
            <p className="px-4 py-3 text-sm text-ink-soft">
              Nothing matches &ldquo;{term}&rdquo;. Try a booking number, a
              name, a passport or a phone number.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results">
              {(data ?? []).map((g) => {
                const Icon = ICON[g.type];
                return (
                  <li key={g.type} role="presentation">
                    <p
                      className="px-4 pb-1 pt-2 text-xs font-semibold text-ink-soft"
                      role="presentation"
                    >
                      {GROUP_LABEL[g.type]}
                    </p>
                    <ul role="group" aria-label={GROUP_LABEL[g.type]}>
                      {g.items.map((item: SearchItem) => {
                        index += 1;
                        const i = index;
                        const on = i === active;
                        return (
                          <li
                            key={`${g.type}-${item.id}`}
                            id={optionId(i)}
                            role="option"
                            aria-selected={on}
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => go(hrefFor(g.type, item))}
                            className={`mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 ${on ? "bg-mist" : ""}`}
                          >
                            <span
                              className="grid size-8 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep"
                              aria-hidden="true"
                            >
                              <Icon size={15} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">
                                {item.title}
                              </span>
                              {item.subtitle && (
                                <span className="block truncate text-xs text-ink-soft">
                                  {item.subtitle}
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
