"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Bot,
  Loader2,
  MessageSquareText,
  Sparkles,
  User2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types/listing";
import type {
  SmartSearchParams,
  SmartSearchResult,
} from "@/lib/types/smart-search";
import { getImageUrl } from "@/lib/utils/listings";
import {
  getListingDisplayLocation,
  getListingDisplayTitle,
} from "@/lib/utils/vehicle-display";
import { cn } from "@/lib/utils";

type SmartSearchResponse = SmartSearchResult & {
  searchUrl: string;
  preview: {
    listings: Listing[];
    total: number;
  };
};

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: SmartSearchResponse;
};

interface SearchAssistantPanelProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const STARTER_PROMPTS = ["small car under 2m", "automatic suv in nairobi"];

const USE_CASE_LABELS: Record<string, string> = {
  first_car: "first-car friendly",
  family: "family-friendly",
  executive: "executive",
  work: "work-ready",
  offroad: "off-road capable",
  fuel_efficient: "fuel-efficient",
};

const INTENT_LABELS: Record<string, string> = {
  reliable: "reliability",
  comfortable: "comfort",
  daily_driver: "daily-driving fit",
  road_trip: "road-trip readiness",
  value: "value-conscious picks",
  spacious: "space and seating",
};

const DRIVE_TYPE_LABELS: Record<string, string> = {
  FWD: "front-wheel drive",
  RWD: "rear-wheel drive",
  AWD: "all-wheel drive",
  "4WD": "four-wheel drive",
};

// Keys that appear in the "Active filter state" chip strip and can be removed.
const REMOVABLE_FILTER_KEYS: (keyof SmartSearchParams)[] = [
  "q",
  "make",
  "model",
  "origin",
  "useCase",
  "intent",
  "minPrice",
  "maxPrice",
  "minYear",
  "maxYear",
  "bodyType",
  "transmission",
  "fuelType",
  "driveType",
  "location",
  "sellerType",
];

const FILTER_KEY_LABELS: Record<string, string> = {
  q: "keyword",
  make: "make",
  model: "model",
  origin: "origin",
  useCase: "use case",
  intent: "intent",
  minPrice: "min price",
  maxPrice: "max price",
  minYear: "min year",
  maxYear: "max year",
  bodyType: "body",
  transmission: "transmission",
  fuelType: "fuel",
  driveType: "drive",
  location: "location",
  sellerType: "seller",
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function formatCurrency(value: string | number | undefined | null) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "";
  return currencyFormatter.format(n);
}

function formatParamValue(key: string, value: string) {
  if (key === "intent") {
    return value
      .split(",")
      .map((v) => INTENT_LABELS[v.trim()] || v.trim())
      .join(", ");
  }
  if (key === "useCase") {
    return USE_CASE_LABELS[value] || value;
  }
  if (key === "driveType") {
    return value
      .split(",")
      .map((v) => DRIVE_TYPE_LABELS[v.trim()] || v.trim())
      .join(", ");
  }
  if (key === "minPrice" || key === "maxPrice") {
    return formatCurrency(value);
  }
  return value;
}

function appendCsvLabels(
  value: string | undefined,
  parts: string[],
  labels?: Record<string, string>
) {
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => parts.push(labels?.[item] || item));
}

function buildFilterSummary(params: SmartSearchParams) {
  const parts: string[] = [];
  const minPrice = params.minPrice ? Number(params.minPrice) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  if (params.origin) parts.push(`${params.origin} brands`);
  if (params.useCase)
    parts.push(USE_CASE_LABELS[params.useCase] || params.useCase);
  if (params.intent) {
    params.intent
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => parts.push(INTENT_LABELS[value] || value));
  }
  appendCsvLabels(params.make, parts);
  appendCsvLabels(params.model, parts);
  appendCsvLabels(params.bodyType, parts);
  appendCsvLabels(params.location, parts);
  if (
    params.minPrice &&
    params.maxPrice &&
    minPrice !== null &&
    maxPrice !== null &&
    minPrice < maxPrice
  ) {
    parts.push(
      `between ${formatCurrency(params.minPrice)} and ${formatCurrency(
        params.maxPrice
      )}`
    );
  } else {
    if (params.maxPrice) parts.push(`under ${formatCurrency(params.maxPrice)}`);
    if (params.minPrice) parts.push(`from ${formatCurrency(params.minPrice)}`);
  }
  appendCsvLabels(params.transmission, parts);
  appendCsvLabels(params.fuelType, parts);
  appendCsvLabels(params.driveType, parts, DRIVE_TYPE_LABELS);
  if (params.sellerType)
    parts.push(params.sellerType === "dealer" ? "dealer only" : "private seller");

  return parts;
}

function buildAssistantReply(result: SmartSearchResponse) {
  const filters = buildFilterSummary(result.params);
  const previewNames = result.preview.listings
    .slice(0, 3)
    .map((listing) => `${listing.make} ${listing.model}`);
  const filterLabel = filters.length > 0 ? filters.join(", ") : "your request";

  if (result.clarification) {
    return result.clarification.question;
  }

  if (result.preview.total === 0) {
    return `No active matches for ${filterLabel}. Try removing one constraint.`;
  }

  const intro = `Found ${result.preview.total} probable match${
    result.preview.total === 1 ? "" : "es"
  } for ${filterLabel}.`;

  if (previewNames.length === 0) {
    return intro;
  }

  return `${intro} Top: ${previewNames.join(", ")}.`;
}

// Pull the current page's filters out of the URL so the assistant can
// start grounded in what the user is already looking at.
function readParamsFromSearchParams(
  searchParams: URLSearchParams
): SmartSearchParams {
  const params: SmartSearchParams = {};
  const copyString = (key: keyof SmartSearchParams) => {
    const v = searchParams.get(key);
    if (v) (params as Record<string, string>)[key] = v;
  };
  REMOVABLE_FILTER_KEYS.forEach((key) => copyString(key));
  if (params.sellerType && !["dealer", "private"].includes(params.sellerType)) {
    delete params.sellerType;
  }
  return params;
}

function hasAnyParam(params: SmartSearchParams) {
  return Object.values(params).some(Boolean);
}

// Compact, horizontally-scrollable listing strip rendered inside assistant bubbles.
function ChatResultStrip({ listings }: { listings: Listing[] }) {
  if (!listings || listings.length === 0) return null;

  return (
    <div className="-mx-3 mt-3 overflow-x-auto pb-1">
      <div className="flex snap-x snap-mandatory gap-2.5 px-3">
        {listings.map((listing) => {
          const firstImage = (listing.images || [])
            .slice()
            .sort((a, b) => a.image_order - b.image_order)[0];
          const src = firstImage
            ? getImageUrl(firstImage.r2_key, "card")
            : "/placeholder-car.jpg";
          const title = getListingDisplayTitle(listing);
          const location = getListingDisplayLocation(listing, { fallback: "" });

          return (
            <Link
              key={listing.id}
              href={`/vehicle/${listing.id}`}
              prefetch={false}
              className="group flex w-[168px] shrink-0 snap-start flex-col gap-2 rounded-[14px] border border-[#e4eaf3] bg-white p-2 shadow-[0_6px_18px_-14px_rgba(15,23,42,0.45)] transition hover:border-primary hover:shadow-[0_10px_22px_-14px_rgba(15,23,42,0.55)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-gray-100">
                <Image
                  src={src}
                  alt={listing.images?.[0]?.alt_text || title}
                  fill
                  sizes="168px"
                  className="object-cover transition group-hover:scale-[1.03]"
                />
                {listing.is_featured ? (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-[12px] font-semibold text-[#1f2937]">
                  {title}
                </p>
                <p className="truncate text-[11px] text-[#6b7280]">
                  {listing.body_type || "Vehicle"}
                  {location ? ` • ${location}` : ""}
                </p>
                <p className="pt-0.5 text-[12px] font-semibold text-primary">
                  {formatCurrency(listing.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SearchAssistantPanel({
  className,
  onClose,
  showCloseButton = false,
}: SearchAssistantPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transcriptEndRef = React.useRef<HTMLDivElement | null>(null);

  // Snapshot current URL filters once; we don't auto-sync subsequent URL
  // changes back into the chat because the chat drives URL updates itself.
  const initialUrlParams = React.useMemo(
    () =>
      readParamsFromSearchParams(
        new URLSearchParams(
          Array.from((searchParams || new URLSearchParams()).entries())
        )
      ),
    [searchParams]
  );
  const hasInitialFilters = hasAnyParam(initialUrlParams);

  const welcomeText = React.useMemo(() => {
    if (!hasInitialFilters) {
      return "Tell me what you want. I’ll show likely matches and ask useful follow-ups.";
    }
    const summary = buildFilterSummary(initialUrlParams);
    const context = summary.length > 0 ? summary.join(", ") : "your current filters";
    return `You’re looking at ${context}. Tell me how to refine — or say “reset” to start fresh.`;
  }, [hasInitialFilters, initialUrlParams]);

  const [messages, setMessages] = React.useState<AssistantMessage[]>(() => [
    {
      id: "assistant-intro",
      role: "assistant",
      content: welcomeText,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<SmartSearchResponse | null>(
    null
  );
  const [didPrimeFromUrl, setDidPrimeFromUrl] = React.useState(false);
  const activeFollowUp =
    lastResult?.clarification ?? lastResult?.refinement ?? null;

  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isLoading, lastResult, messages]);

  // Prime `lastResult` from the URL on first mount so the filter chips and
  // preview strip reflect the page the user is already looking at.
  React.useEffect(() => {
    if (didPrimeFromUrl) return;
    setDidPrimeFromUrl(true);
    if (!hasInitialFilters) return;
    void primeFromCurrentUrl(initialUrlParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postSearchTurn = async (
    query: string,
    currentParams: SmartSearchParams
  ): Promise<SmartSearchResponse> => {
    const response = await fetch("/api/ai/smart-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, currentParams }),
    });
    if (!response.ok) throw new Error("Assistant search failed.");
    return (await response.json()) as SmartSearchResponse;
  };

  const primeFromCurrentUrl = async (params: SmartSearchParams) => {
    setIsLoading(true);
    try {
      // Empty query + currentParams returns the preview for the current state
      // without introducing a new user turn in the transcript.
      const result = await postSearchTurn("", params);
      setLastResult(result);
    } catch {
      // Silent: the welcome message is already context-aware; failure is
      // non-fatal — user can still start a new turn manually.
    } finally {
      setIsLoading(false);
    }
  };

  const runAssistantSearch = async (
    prompt: string,
    options?: { currentParams?: SmartSearchResponse["params"] }
  ) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const nextUserMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const result = await postSearchTurn(
        trimmed,
        options?.currentParams || lastResult?.params || initialUrlParams
      );
      setLastResult(result);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: buildAssistantReply(result),
          result,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "I could not run that search. Try again or use the quick search dialog.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a single filter: rebuild params without that key, re-query with an
  // empty turn query (so the server just recomputes the preview/refinement).
  const removeFilter = async (key: keyof SmartSearchParams) => {
    if (!lastResult) return;
    const nextParams: SmartSearchParams = { ...lastResult.params };
    if (key === "minPrice" || key === "maxPrice") {
      delete nextParams.minPrice;
      delete nextParams.maxPrice;
    } else if (key === "minYear" || key === "maxYear") {
      delete nextParams.minYear;
      delete nextParams.maxYear;
    } else {
      delete nextParams[key];
    }

    setIsLoading(true);
    try {
      const result = await postSearchTurn("", nextParams);
      setLastResult(result);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Removed ${FILTER_KEY_LABELS[key] || key}. ${buildAssistantReply(
            result
          )}`,
          result,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "Could not remove that filter. Try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className={cn(
        "flex h-full min-h-[640px] flex-col overflow-hidden rounded-[18px] border border-[#dfe7f2] bg-white shadow-[0_18px_48px_-36px_rgba(15,23,42,0.35)]",
        className
      )}
    >
      <div className="border-b border-[#e6ebf2] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <MessageSquareText className="h-4 w-4" />
              Search Assistant
            </p>
            <p className="mt-1 text-[13px] text-[#667085]">
              Ask in plain language or refine current filters.
            </p>
          </div>

          {showCloseButton && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e0ec] bg-white text-[#344054] transition hover:border-primary hover:text-primary"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#98a2b3]">
            Try
          </span>
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void runAssistantSearch(prompt)}
              className="shrink-0 rounded-full border border-brand-muted-border bg-brand-soft-surface px-2.5 py-1 text-[11px] font-medium text-primary transition hover:border-primary hover:text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#fdfefe_100%)] px-4 py-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "assistant" ? "justify-start" : "justify-end"
              )}
            >
              {message.role === "assistant" ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-[85%] rounded-[22px] px-4 py-3 text-[14px] leading-6 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.4)]",
                  message.role === "assistant"
                    ? "rounded-bl-[10px] border border-[#dde5f0] bg-white text-[#243041]"
                    : "rounded-br-[10px] bg-primary text-white"
                )}
              >
                <p>{message.content}</p>

                {message.role === "assistant" &&
                message.result &&
                message.result.preview.listings.length > 0 ? (
                  <ChatResultStrip listings={message.result.preview.listings} />
                ) : null}

                {message.role === "assistant" && message.result ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.result.preview.total > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(message.result?.searchUrl || "/search")
                        }
                        className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-brand-hover"
                      >
                        Show probable matches
                      </button>
                    ) : null}

                    {(message.result.clarification ?? message.result.refinement)?.options.map(
                      (option) => (
                        <button
                          key={`${message.id}-${option.label}-${option.query}`}
                          type="button"
                          onClick={() =>
                            void runAssistantSearch(option.query, {
                              currentParams: message.result?.params,
                            })
                          }
                          className="rounded-full border border-brand-muted-border bg-white px-3 py-1.5 text-[12px] font-medium text-primary transition hover:border-primary hover:text-primary"
                        >
                          {option.label}
                        </button>
                      )
                    )}
                  </div>
                ) : null}
              </div>
              {message.role === "user" ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint-strong text-brand-hover">
                  <User2 className="h-4 w-4" />
                </div>
              ) : null}
            </div>
          ))}

          {isLoading ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-[22px] rounded-bl-[10px] border border-[#dde5f0] bg-white px-4 py-3 text-[14px] text-[#5f6773] shadow-[0_12px_28px_-20px_rgba(15,23,42,0.4)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching current inventory...
              </div>
            </div>
          ) : null}

          {lastResult ? (
            <div className="rounded-[18px] border border-[#dde5f0] bg-white p-3 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.4)]">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#617086]">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Filters
                </p>
                {lastResult.preview.total > 0 ? (
                  <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#2753c7]">
                    {lastResult.preview.total} match{lastResult.preview.total === 1 ? "" : "es"}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.values(lastResult.params).some(Boolean) ? (
                  (Object.entries(lastResult.params) as [
                    keyof SmartSearchParams,
                    string | undefined
                  ][]).map(([key, value]) =>
                    value ? (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-brand-muted-border bg-brand-soft-surface py-1 pl-2.5 pr-1 text-[11px] font-medium text-primary"
                      >
                        <span>
                          {FILTER_KEY_LABELS[key] || key}: {formatParamValue(key, value)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void removeFilter(key)}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-primary transition hover:bg-[#dbe6ff]"
                          aria-label={`Remove ${FILTER_KEY_LABELS[key] || key} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null
                  )
                ) : (
                  <span className="rounded-full border border-brand-muted-border bg-brand-soft-surface px-2.5 py-1 text-[11px] font-medium text-primary">
                    No filters
                  </span>
                )}
              </div>

              {activeFollowUp ? (
                <div className="mt-3 rounded-[14px] border border-brand-muted-border bg-brand-soft-surface p-3">
                  <p className="text-[13px] font-semibold text-[#274690]">
                    {activeFollowUp.question}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeFollowUp.options.map((option) => (
                      <button
                        key={`${option.label}-${option.query}`}
                        type="button"
                        onClick={() => void runAssistantSearch(option.query)}
                        className="rounded-full border border-brand-muted-border bg-white px-2.5 py-1 text-[11px] font-medium text-primary transition hover:border-primary hover:text-primary"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div ref={transcriptEndRef} />
        </div>
      </div>

      <div className="border-t border-[#e6ebf2] bg-white px-4 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {lastResult ? (
            <Button
              type="button"
              className="h-10 rounded-[14px] bg-primary px-4 text-white hover:bg-brand-hover"
              onClick={() => router.push(lastResult.searchUrl)}
            >
              Apply To Results
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-[14px]"
            onClick={() => {
              setMessages([
                {
                  id: "assistant-intro",
                  role: "assistant",
                  content:
                    "Tell me what you want. I’ll show likely matches and ask useful follow-ups.",
                },
              ]);
              setLastResult(null);
              setInput("");
            }}
          >
            Reset
          </Button>
        </div>

        <form
          className="flex items-end gap-3 rounded-[20px] border border-[#d7dce5] bg-[#fbfcff] px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            void runAssistantSearch(input);
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Example: only in Nakuru and automatic"
            rows={input ? Math.min(Math.max(input.split("\n").length, 2), 5) : 2}
            className="min-h-[48px] flex-1 resize-none border-0 bg-transparent py-2 text-[14px] leading-6 outline-none placeholder:text-[#98a2b3]"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void runAssistantSearch(input);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#202224] text-white transition hover:bg-[#111315] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Ask assistant"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}
