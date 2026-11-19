"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLastSuccessfulValue } from "@/lib/hooks/use-last-successful-value";
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
  result: { listings: Listing[]; total: number; totalPages: number } | null;
  resultKey: string;
  makes: string[];
}

export function SearchPageClient({
  result: incomingResult,
  resultKey,
  makes,
}: SearchPageClientProps) {
  const result = useLastSuccessfulValue(incomingResult, resultKey);
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();
  const searchParams = useSearchParams();
  const featuredOnly = searchParams.get("featured") === "true";
  const withoutFeatured = new URLSearchParams(searchParams.toString());
  withoutFeatured.delete("featured");
  withoutFeatured.delete("page");
  const remainingQuery = withoutFeatured.toString();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isDesktopAssistantOpen, setIsDesktopAssistantOpen] = useState(false);
  const [isMobileAssistantOpen, setIsMobileAssistantOpen] = useState(false);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-[20px] border border-[#e8ebf2] bg-[#fbfcfe] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Search Tools
          </p>
          <h2 className="mt-1.5 text-[22px] font-semibold leading-7 text-[#202224]">
            Refine with quick search or assistant chat
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#6f7784]">
            Use quick search for one-shot intent parsing or open the assistant for conversational
            refinements on this page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-[12px] border-[#d9dfe8] bg-white px-3.5 text-[14px] lg:hidden"
            onClick={() => setIsMobileAssistantOpen(true)}
          >
            <MessageSquareText className="mr-2 h-4 w-4" />
            Assistant Chat
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden h-10 rounded-[12px] border-[#d9dfe8] bg-white px-3.5 text-[14px] lg:inline-flex"
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
            className="h-10 rounded-[12px] bg-primary px-3.5 text-[14px] text-white hover:bg-brand-hover"
            onClick={() => setIsQuickSearchOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Search
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-5 ${
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

          {featuredOnly ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <p className="font-medium text-gray-900">Featured listings only</p>
              <Link
                href={remainingQuery ? `/search?${remainingQuery}` : "/search"}
                className="font-medium text-primary underline underline-offset-4"
              >
                Remove featured filter
              </Link>
            </div>
          ) : null}

          {incomingResult === null ? (
            <div role="status" className="my-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <p>{result ? "Listings could not be refreshed. Showing the last loaded results." : "Listings could not be loaded. Please try again."}</p>
              <Button variant="outline" disabled={isRetrying} onClick={() => startRetry(() => router.refresh())}>
                {isRetrying ? "Retrying…" : "Try again"}
              </Button>
            </div>
          ) : null}

          {result ? (
            <>
              <div className="mb-5 mt-3 text-[13px] text-gray-600">
                Showing {result.listings.length} of {result.total} results
              </div>
              <SearchResults
                listings={result.listings}
                total={result.total}
                totalPages={result.totalPages}
                compact={isDesktopAssistantOpen}
              />
            </>
          ) : null}
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
        totalCount={result?.total ?? 0}
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
