"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Sparkles, Loader2 } from "lucide-react";

interface QuickSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Parses a natural language car search query into URL search params.
 * Examples:
 *   "BMW X5 under 5 million" → make=BMW&model=X5&maxPrice=5000000
 *   "Toyota 2020 diesel" → make=Toyota&minYear=2020&fuel=Diesel
 *   "SUV below 3m in Nairobi" → bodyType=SUV&maxPrice=3000000&location=Nairobi
 */
function parseQuickSearch(query: string): URLSearchParams {
  const params = new URLSearchParams();
  const q = query.trim();
  if (!q) return params;

  const lower = q.toLowerCase();

  // Known car makes
  const MAKES = [
    "Toyota", "BMW", "Mercedes", "Mercedes-Benz", "Audi", "Honda", "Nissan",
    "Mazda", "Subaru", "Volkswagen", "VW", "Land Rover", "Range Rover",
    "Porsche", "Lexus", "Mitsubishi", "Suzuki", "Hyundai", "Kia", "Ford",
    "Chevrolet", "Jeep", "Peugeot", "Isuzu", "Volvo", "Jaguar", "Mini",
  ];

  // Known body types
  const BODY_TYPES = ["sedan", "suv", "hatchback", "pickup", "truck", "van", "coupe", "convertible", "wagon", "crossover"];

  // Known fuel types
  const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"];

  // Known locations
  const LOCATIONS = ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika", "nyeri", "malindi"];

  // Extract make
  for (const make of MAKES) {
    if (lower.includes(make.toLowerCase())) {
      params.set("make", make === "VW" ? "Volkswagen" : make === "Mercedes" ? "Mercedes-Benz" : make);
      break;
    }
  }

  // Extract year (4-digit number between 1990-2030)
  const yearMatch = q.match(/\b(19[9]\d|20[0-3]\d)\b/);
  if (yearMatch) {
    params.set("minYear", yearMatch[1]);
  }

  // Extract price — "under X million", "below Xm", "max Xk", "budget X"
  const pricePatterns = [
    /(?:under|below|max|budget|less than|cheaper than)\s*(?:ksh?|kes)?\s*([\d.]+)\s*(?:million|m\b)/i,
    /(?:under|below|max|budget|less than|cheaper than)\s*(?:ksh?|kes)?\s*([\d,]+)\s*(?:k\b)?/i,
    /(?:ksh?|kes)\s*([\d,]+)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = lower.match(pattern);
    if (match) {
      let price = parseFloat(match[1].replace(/,/g, ""));
      // If matched with "million" or "m", multiply
      if (/million|m\b/i.test(match[0])) {
        price = price * 1_000_000;
      } else if (/k\b/i.test(match[0])) {
        price = price * 1_000;
      } else if (price < 1000) {
        // Likely millions if small number with "under"
        price = price * 1_000_000;
      }
      if (price > 0) {
        params.set("maxPrice", String(Math.round(price)));
        break;
      }
    }
  }

  // "above X million", "from Xm", "min Xm"
  const minPriceMatch = lower.match(/(?:above|from|min|over|more than|starting)\s*(?:ksh?|kes)?\s*([\d.]+)\s*(?:million|m\b)/i);
  if (minPriceMatch) {
    const price = parseFloat(minPriceMatch[1]) * 1_000_000;
    params.set("minPrice", String(Math.round(price)));
  }

  // Extract body type
  for (const bt of BODY_TYPES) {
    if (lower.includes(bt)) {
      params.set("bodyType", bt.charAt(0).toUpperCase() + bt.slice(1));
      break;
    }
  }

  // Extract fuel type
  for (const ft of FUEL_TYPES) {
    if (lower.includes(ft)) {
      params.set("fuel", ft.charAt(0).toUpperCase() + ft.slice(1));
      break;
    }
  }

  // Extract location
  for (const loc of LOCATIONS) {
    if (lower.includes(loc)) {
      params.set("location", loc.charAt(0).toUpperCase() + loc.slice(1));
      break;
    }
  }

  // If nothing was parsed, use as general search text
  if (params.toString() === "") {
    params.set("q", q);
  }

  return params;
}

const SUGGESTIONS = [
  "Toyota under 2 million",
  "BMW SUV in Nairobi",
  "Diesel cars below 5m",
  "2020 Mercedes sedan",
  "Honda hybrid under 3 million",
  "SUV below 10 million",
];

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSearch = (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    const params = parseQuickSearch(q);
    onOpenChange(false);
    setIsSearching(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Search
            <span className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              NEW
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
                onClick={() => handleSearch(suggestion)}
                className="rounded-full border border-border bg-gray-50 px-3 py-1.5 text-xs text-foreground hover:bg-gray-100 hover:border-primary/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
