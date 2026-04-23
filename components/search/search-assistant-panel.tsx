"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Bot, Loader2, MessageSquareText, Sparkles, User2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types/listing";
import type { SmartSearchResult } from "@/lib/types/smart-search";
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
};

interface SearchAssistantPanelProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const STARTER_PROMPTS = [
  "small car under 2m",
  "european sedan",
  "automatic suv in nairobi",
  "dealer crossover under 4m",
];

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

function buildFilterSummary(result: SmartSearchResponse) {
  const parts: string[] = [];

  if (result.params.origin) parts.push(`${result.params.origin} brands`);
  if (result.params.useCase) parts.push(USE_CASE_LABELS[result.params.useCase] || result.params.useCase);
  if (result.params.intent) {
    result.params.intent
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => parts.push(INTENT_LABELS[value] || value));
  }
  if (result.params.make) parts.push(result.params.make);
  if (result.params.model) parts.push(result.params.model);
  if (result.params.bodyType) parts.push(result.params.bodyType);
  if (result.params.location) parts.push(result.params.location);
  if (result.params.maxPrice) {
    parts.push(
      `under ${new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(Number(result.params.maxPrice))}`
    );
  }
  if (result.params.minPrice) {
    parts.push(
      `from ${new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(Number(result.params.minPrice))}`
    );
  }
  if (result.params.transmission) parts.push(result.params.transmission);
  if (result.params.fuelType) parts.push(result.params.fuelType);
  if (result.params.sellerType) parts.push(result.params.sellerType === "dealer" ? "dealer only" : "private seller");

  return parts;
}

function buildAssistantReply(result: SmartSearchResponse) {
  const filters = buildFilterSummary(result);
  const previewNames = result.preview.listings
    .slice(0, 3)
    .map((listing) => `${listing.make} ${listing.model}`);
  const interpretation =
    filters.length > 0 ? `I interpreted this as ${filters.join(", ")}.` : "";

  if (result.preview.total === 0) {
    return [
      interpretation,
      filters.length > 0
        ? `There are no active matches for that interpretation right now.`
        : "I could not find active matches for that search right now.",
      "Try broadening the budget, changing the location, or removing one constraint.",
    ].filter(Boolean).join(" ");
  }

  const intro =
    filters.length > 0
      ? `I found ${result.preview.total} match${result.preview.total === 1 ? "" : "es"} for that interpretation.`
      : `I found ${result.preview.total} matching listing${result.preview.total === 1 ? "" : "s"}.`;

  if (previewNames.length === 0) {
    return [interpretation, intro].filter(Boolean).join(" ");
  }

  return [interpretation, `${intro} Top result${previewNames.length === 1 ? "" : "s"}: ${previewNames.join(", ")}.`]
    .filter(Boolean)
    .join(" ");
}

export function SearchAssistantPanel({
  className,
  onClose,
  showCloseButton = false,
}: SearchAssistantPanelProps) {
  const router = useRouter();
  const transcriptEndRef = React.useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = React.useState<AssistantMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content:
        "Ask for vehicles naturally. I can narrow by body type, budget, location, seller type, brand, and abstract preferences like comfort or reliability, then apply the result to this page.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<SmartSearchResponse | null>(null);

  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isLoading, lastResult, messages]);

  const runAssistantSearch = async (prompt: string) => {
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
      const response = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          currentParams: lastResult?.params || {},
        }),
      });

      if (!response.ok) {
        throw new Error("Assistant search failed.");
      }

      const result = (await response.json()) as SmartSearchResponse;
      setLastResult(result);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: buildAssistantReply(result),
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

  return (
    <section
      className={cn(
        "flex h-full min-h-[640px] flex-col overflow-hidden rounded-[26px] border border-[#dfe7f2] bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]",
        className
      )}
    >
      <div className="border-b border-[#e6ebf2] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fd_100%)] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <MessageSquareText className="h-4 w-4" />
              Search Assistant
            </p>
            <h3 className="mt-2 text-[22px] font-semibold text-[#202224]">
              Search like a live chat
            </h3>
            <p className="mt-1 max-w-sm text-[14px] leading-6 text-[#667085]">
              Describe the car you want in plain language. I&apos;ll interpret the request, keep the context, and update the search path for this page.
            </p>
          </div>

          {showCloseButton && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e0ec] bg-white text-[#344054] transition hover:border-primary hover:text-primary"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void runAssistantSearch(prompt)}
              className="rounded-full border border-[#d6e2ff] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3157c8] transition hover:border-primary hover:text-primary"
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
                    : "rounded-br-[10px] bg-[#2563eb] text-white"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#1d4ed8]">
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
            <div className="rounded-[22px] border border-[#dde5f0] bg-white p-4 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.4)]">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#617086]">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Active Filter State
                </p>
                {lastResult.preview.total > 0 ? (
                  <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#2753c7]">
                    {lastResult.preview.total} match{lastResult.preview.total === 1 ? "" : "es"}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(lastResult.params).map(([key, value]) =>
                  value ? (
                    <span
                      key={key}
                      className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1.5 text-[12px] font-medium text-[#3157c8]"
                    >
                      {key}: {value}
                    </span>
                  ) : null
                )}
              </div>
              <p className="mt-3 text-[13px] leading-6 text-[#667085]">
                Keep replying with short corrections like
                {" "}
                <span className="font-medium text-[#30343a]">&quot;German only&quot;</span>,
                {" "}
                <span className="font-medium text-[#30343a]">&quot;actually SUV&quot;</span>,
                {" "}
                or
                {" "}
                <span className="font-medium text-[#30343a]">&quot;remove price limit&quot;</span>
                {" "}
                and I&apos;ll adjust the active search interpretation.
              </p>

              {lastResult.clarification ? (
                <div className="mt-4 rounded-[18px] border border-[#dbe6ff] bg-[#f7faff] p-4">
                  <p className="text-[13px] font-semibold text-[#274690]">
                    {lastResult.clarification.question}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lastResult.clarification.options.map((option) => (
                      <button
                        key={`${option.label}-${option.query}`}
                        type="button"
                        onClick={() => void runAssistantSearch(option.query)}
                        className="rounded-full border border-[#c9d9ff] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3157c8] transition hover:border-primary hover:text-primary"
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
              className="h-10 rounded-[14px] bg-[#2563eb] px-4 text-white hover:bg-[#1d4ed8]"
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
                    "Ask for vehicles naturally. I can narrow by body type, budget, location, seller type, brand, and abstract preferences like comfort or reliability, then apply the result to this page.",
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
            placeholder="Example: only in nakuru and automatic"
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
