"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/shared/types";

interface PaginationProps {
  meta: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  meta,
  currentPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between mt-4 ${className}`}>
      <p className="text-sm text-muted-foreground">
        Halaman {meta.currentPage} dari {meta.totalPages} ({meta.totalItems}{" "}
        total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onPageChange(Math.min(meta.totalPages, currentPage + 1))
          }
          disabled={currentPage === meta.totalPages}
          className="rounded-lg transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
