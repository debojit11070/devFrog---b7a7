"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/api/types";
import { formatNumber } from "@/lib/utils";

export function Pagination({ meta, onPageChange }: { meta?: PaginationMeta; onPageChange: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) {
    return meta && meta.total > 0 ? (
      <p className="text-sm text-muted-foreground">{formatNumber(meta.total)} result{meta.total === 1 ? "" : "s"}</p>
    ) : null;
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(start)}–{formatNumber(end)}</span> of{" "}
        {formatNumber(meta.total)}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}>
          <ChevronLeft aria-hidden />
          Previous
        </Button>
        <span className="min-w-20 rounded-full bg-muted px-3 py-1.5 text-center text-sm tabular-nums">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
        >
          Next
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
