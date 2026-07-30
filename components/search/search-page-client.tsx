"use client";

import { useState } from "react";
import { Listing } from "@/lib/types/listing";
import { QuickFilterBar } from "./quick-filter-bar";
import { FilterSheet } from "./filter-sheet";
import { SearchResults } from "./search-results";
import type { ListingCategory } from "@/lib/constants/marketplace";

interface SearchPageClientProps {
  listings: Listing[];
  total: number;
  totalPages: number;
  totalCount: number;
  makes: string[];
  category?: ListingCategory;
}

export function SearchPageClient({
  listings,
  total,
  totalPages,
  totalCount,
  makes,
  category,
}: SearchPageClientProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  return (
    <>
      {/* Quick Filter Bar */}
      <QuickFilterBar
        makes={makes}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
      />

      {/* Results Count */}
      <div className="mt-4 mb-6 text-sm text-gray-600">
        Showing {listings.length} of {total} results
      </div>

      {/* Results Grid */}
      <SearchResults
        listings={listings}
        total={total}
        totalPages={totalPages}
      />

      {/* Filter Sheet (Slide-out Panel) */}
      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        totalCount={totalCount}
        makes={makes}
        category={category}
      />
    </>
  );
}
