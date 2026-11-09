"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationInfo } from "../types/hotel";

/** 1 … 4 5 [6] 7 8 … 20 — always first, last, and two either side of the current page. */
function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set([
    1,
    total,
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
  ]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

type Props = {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  /** Dims the controls while the next page loads. */
  busy?: boolean;
};

export function Pagination({ pagination, onPageChange, busy }: Props) {
  const { page, limit, total, totalPages } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const btn =
    "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
    >
      <p className="text-sm text-ink-soft" aria-live="polite">
        Showing{" "}
        <span className="font-semibold text-ink">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold text-ink">{total}</span>
      </p>

      {totalPages > 1 && (
        <div className={`flex items-center gap-1 ${busy ? "opacity-60" : ""}`}>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={`${btn} text-ink-soft hover:bg-mist hover:text-ink`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Full page list from sm up; a compact "3 / 12" on phones */}
          <span className="px-2 text-sm font-semibold text-ink sm:hidden">
            {page} / {totalPages}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {pageList(page, totalPages).map((p, i) =>
              p === "gap" ? (
                <span
                  key={`gap-${i}`}
                  className="px-1 text-sm text-ink-soft"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className={`${btn} ${
                    p === page
                      ? "bg-ink text-white"
                      : "text-ink-soft hover:bg-mist hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className={`${btn} text-ink-soft hover:bg-mist hover:text-ink`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
