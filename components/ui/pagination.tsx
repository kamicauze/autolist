"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Link
        href={createPageUrl(currentPage - 1)}
        passHref
        aria-disabled={currentPage <= 1}
        className={cn(
          currentPage <= 1 ? "pointer-events-none opacity-50" : ""
        )}
      >
        <Button variant="outline" size="icon" disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // simple logic: show all pages if total < 7, else show current, first, last, and surrounding
          // For MVP, just limiting to max 5 visible or simple logic for now
           if (
            totalPages > 7 &&
            page !== 1 &&
            page !== totalPages &&
            (page < currentPage - 1 || page > currentPage + 1)
          ) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="text-muted-foreground">...</span>;
            }
            return null;
          }

          return (
            <Link key={page} href={createPageUrl(page)}>
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-9 h-9"
              >
                {page}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      <Link
        href={createPageUrl(currentPage + 1)}
        passHref
        aria-disabled={currentPage >= totalPages}
        className={cn(
          currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
        )}
      >
        <Button variant="outline" size="icon" disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </Link>
    </div>
  );
}
