"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination controls with page numbers and prev/next buttons.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate visible page numbers (show max 5 pages around current)
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "rounded-lg p-2 text-rosely-dusk transition-colors",
          page <= 1
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-rosely-petal hover:text-rosely-night"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <PageButton page={1} current={page} onClick={onPageChange} />
          {start > 2 && <span className="px-1 text-xs text-rosely-mist">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageButton key={p} page={p} current={page} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-xs text-rosely-mist">…</span>
          )}
          <PageButton page={totalPages} current={page} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "rounded-lg p-2 text-rosely-dusk transition-colors",
          page >= totalPages
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-rosely-petal hover:text-rosely-night"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (page: number) => void;
}) {
  const isActive = page === current;

  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        "min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors",
        isActive
          ? "bg-rosely-plum text-white"
          : "text-rosely-dusk hover:bg-rosely-petal hover:text-rosely-night"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {page}
    </button>
  );
}
