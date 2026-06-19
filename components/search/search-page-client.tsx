"use client";

import { useState } from "react";
import { MessageSquareText, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Listing } from "@/lib/types/listing";
import { QuickFilterBar } from "./quick-filter-bar";
import { FilterSheet } from "./filter-sheet";
import { SearchResults } from "./search-results";
import { QuickSearchDialog } from "@/components/home/quick-search-dialog";
import { SearchAssistantPanel } from "./search-assistant-panel";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

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
  const [isDesktopAssistantOpen, setIsDesktopAssistantOpen] = useState(false);
  const [isMobileAssistantOpen, setIsMobileAssistantOpen] = useState(false);

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
            className="h-11 rounded-[14px] border-[#d9dfe8] bg-white px-4 lg:hidden"
            onClick={() => setIsMobileAssistantOpen(true)}
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Assistant Chat
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden h-11 rounded-[14px] border-[#d9dfe8] bg-white px-4 lg:inline-flex"
            onClick={() => setIsDesktopAssistantOpen((prev) => !prev)}
          >
            {isDesktopAssistantOpen ? (
              <PanelRightClose className="mr-2 h-4 w-4" />
            ) : (
              <PanelRightOpen className="mr-2 h-4 w-4" />
            )}
            {isDesktopAssistantOpen ? "Hide Assistant" : "Open Search Assistant"}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-[14px] bg-primary px-4 text-white hover:bg-brand-hover"
            onClick={() => setIsQuickSearchOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Search
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          isDesktopAssistantOpen
            ? "lg:grid-cols-[minmax(0,1fr)_420px]"
              : ""
        }`}
      >
        <div className="min-w-0">
          {/* Quick Filter Bar */}
          <QuickFilterBar
            makes={makes}
            onOpenFilters={() => setIsFilterSheetOpen(true)}
          />

          {/* Results Count */}
          <div className="mb-6 mt-4 text-sm text-gray-600">
            Showing {listings.length} of {total} results
          </div>

          {/* Results Grid */}
          <SearchResults
            listings={listings}
            total={total}
            totalPages={totalPages}
            compact={isDesktopAssistantOpen}
          />
        </div>

        {isDesktopAssistantOpen ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-4">
              <SearchAssistantPanel
                className="min-h-0 flex-1"
                onClose={() => setIsDesktopAssistantOpen(false)}
                showCloseButton
              />
            </div>
          </aside>
        ) : null}
      </div>

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

      <Sheet open={isMobileAssistantOpen} onOpenChange={setIsMobileAssistantOpen}>
        <SheetContent side="right" className="w-full border-l-0 p-0 sm:max-w-lg">
          <SearchAssistantPanel className="h-full min-h-0 rounded-none border-0 shadow-none" />
        </SheetContent>
      </Sheet>
    </>
  );
}
