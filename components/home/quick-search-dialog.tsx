"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Sparkles, Loader2 } from "lucide-react";
import type { SmartSearchResult } from "@/lib/types/smart-search";
import type { Listing } from "@/lib/types/listing";
import { getImageUrl } from "@/lib/utils/listings";
import { getListingDisplayLocation } from "@/lib/utils/vehicle-display";

interface QuickSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTIONS = [
  "Toyota under 2 million",
  "BMW SUV in Nairobi",
  "Diesel cars below 5m",
  "2020 Mercedes sedan",
  "Honda hybrid under 3 million",
  "SUV below 10 million",
];

type SmartSearchResponse = SmartSearchResult & {
  searchUrl: string;
  preview: {
    listings: Listing[];
    total: number;
  };
};

function hasActiveParams(result: SmartSearchResponse) {
  return Object.values(result.params).some(Boolean);
}

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<SmartSearchResponse | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSearchResult(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSearch = async (
    searchQuery: string,
    options?: { useCurrentParams?: boolean }
  ) => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          currentParams: options?.useCurrentParams ? searchResult?.params || {} : {},
        }),
      });

      if (!response.ok) {
        throw new Error("Smart search failed.");
      }

      const result = (await response.json()) as SmartSearchResponse;
      setSearchResult(result);
    } catch {
      setSearchResult(null);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[960px]">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex flex-col gap-1 text-lg">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Search
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Powered by Autolist Intelligence
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try &quot;Toyota under 2 million&quot; or &quot;BMW SUV in Nairobi&quot;"
              className="h-12 w-full rounded-xl border border-border bg-gray-50 pl-10 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {query && (
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Try searching for
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void handleSearch(suggestion)}
                className="rounded-full border border-border bg-gray-50 px-3 py-1.5 text-xs text-foreground hover:bg-gray-100 hover:border-primary/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {(searchResult || isSearching) && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Smart Results
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {isSearching
                    ? "Searching listings..."
                    : searchResult?.clarification
                      ? "Needs one more detail"
                      : `${searchResult?.preview.total || 0} match${searchResult?.preview.total === 1 ? "" : "es"} found`}
                </p>
                {!isSearching && searchResult && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {searchResult.note}
                  </p>
                )}
              </div>

              {searchResult && !searchResult.clarification && hasActiveParams(searchResult) && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(searchResult.searchUrl);
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Show probable matches
                </button>
              )}
            </div>

            {isSearching ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="h-32 animate-pulse bg-muted" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResult?.clarification ? (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  {searchResult.clarification.question}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick one or type a correction.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {searchResult.clarification.options.map((option) => (
                    <button
                      key={`${option.label}-${option.query}`}
                      type="button"
                      onClick={() => void handleSearch(option.query, { useCurrentParams: true })}
                      className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResult ? (
              <>
                {searchResult.refinement ? (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">
                      {searchResult.refinement.question}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {searchResult.refinement.options.map((option) => (
                        <button
                          key={`${option.label}-${option.query}`}
                          type="button"
                          onClick={() => void handleSearch(option.query, { useCurrentParams: true })}
                          className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/10"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {searchResult.preview.listings.length > 0 ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResult.preview.listings.map((listing) => {
                      const sortedImages = (listing.images || [])
                        .slice()
                        .sort((a, b) => a.image_order - b.image_order);
                      const firstImage = sortedImages[0] ? getImageUrl(sortedImages[0].r2_key, "card") : "/placeholder-car.jpg";
                      const sellerName =
                        listing.dealer?.name ||
                        listing.seller?.full_name ||
                        "Private Seller";

                      return (
                        <Link
                          key={listing.id}
                          href={`/vehicle/${listing.id}`}
                          onClick={() => onOpenChange(false)}
                          className="overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-primary/30"
                        >
                          <div className="relative h-36 w-full bg-muted">
                            <Image
                              src={firstImage}
                              alt={`${listing.year} ${listing.make} ${listing.model}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          <div className="space-y-2 p-3">
                            <p className="line-clamp-1 text-sm font-semibold text-foreground">
                              {listing.year} {listing.make} {listing.model}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {new Intl.NumberFormat("en-KE", {
                                style: "currency",
                                currency: "KES",
                                maximumFractionDigits: 0,
                              }).format(listing.price)}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                              <span>{listing.body_type || "Vehicle"}</span>
                              <span>{getListingDisplayLocation(listing)}</span>
                              {listing.transmission && <span>{listing.transmission}</span>}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{sellerName}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">No listings matched this smart search.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a broader budget, a different location, or open the full results page to refine filters.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
