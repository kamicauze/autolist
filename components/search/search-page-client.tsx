"use client";

import { useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Listing } from "@/lib/types/listing";
import { QuickFilterBar } from "./quick-filter-bar";
import { FilterSheet } from "./filter-sheet";
import { SearchResults } from "./search-results";
import { QuickSearchDialog } from "@/components/home/quick-search-dialog";
import { SearchAssistantPanel } from "./search-assistant-panel";

interface SearchPageClientProps {
  listings: Listing[];
  total: number;
  totalPages: number;
  totalCount: number;
  makes: string[];
}

export function SearchPageClient({
  listings,
  total,
  totalPages,
  totalCount,
  makes,
}: SearchPageClientProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-[#e8ebf2] bg-[#fbfcfe] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Search Tools
          </p>
          <h2 className="mt-2 text-[24px] font-semibold text-[#202224]">
            Refine with quick search or assistant chat
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-[#6f7784]">
            Use quick search for one-shot intent parsing or open the assistant for conversational
            refinements on this page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[14px] border-[#d9dfe8] bg-white px-4"
            onClick={() => setIsAssistantOpen((prev) => !prev)}
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            {isAssistantOpen ? "Hide Assistant" : "Open Assistant"}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-[14px] bg-[#2563eb] px-4 text-white hover:bg-[#1d4ed8]"
            onClick={() => setIsQuickSearchOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Search
          </Button>
        </div>
      </div>

      {isAssistantOpen ? <div className="mb-6"><SearchAssistantPanel /></div> : null}

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
      />

      <QuickSearchDialog
        open={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
      />
    </>
  );
}
