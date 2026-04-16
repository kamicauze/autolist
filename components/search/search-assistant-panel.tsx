"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types/listing";
import type { SmartSearchResult } from "@/lib/types/smart-search";

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

function buildFilterSummary(result: SmartSearchResponse) {
  const parts: string[] = [];

  if (result.params.origin) parts.push(`${result.params.origin} brands`);
  if (result.params.useCase) parts.push(USE_CASE_LABELS[result.params.useCase] || result.params.useCase);
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

export function SearchAssistantPanel() {
  const router = useRouter();
  const [messages, setMessages] = React.useState<AssistantMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content:
        "Ask for vehicles naturally. I can narrow by body type, budget, location, seller type, and brand, then apply the result to this page.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<SmartSearchResponse | null>(null);

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
    <section className="rounded-[24px] border border-[#e8ebf2] bg-[#f8fbff] p-5">
      <div className="flex flex-col gap-3 border-b border-[#e3e8f1] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <MessageSquareText className="h-4 w-4" />
            Search Assistant
          </p>
          <h3 className="mt-2 text-[22px] font-semibold text-[#202224]">
            Refine the search conversationally
          </h3>
          <p className="mt-1 max-w-2xl text-[14px] leading-6 text-[#6f7784]">
            Ask naturally, then apply the interpreted filters to the live search results page.
          </p>
        </div>

        {lastResult ? (
          <Button
            type="button"
            className="h-11 rounded-[14px] bg-[#2563eb] px-4 text-white hover:bg-[#1d4ed8]"
            onClick={() => router.push(lastResult.searchUrl)}
          >
            Apply To Results
          </Button>
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

      <div className="mt-5 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "assistant"
                ? "rounded-[18px] border border-[#dfe7f4] bg-white px-4 py-3 text-[14px] leading-6 text-[#30343a]"
                : "ml-auto max-w-[85%] rounded-[18px] bg-[#2563eb] px-4 py-3 text-[14px] leading-6 text-white"
            }
          >
            {message.content}
          </div>
        ))}

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-[#dfe7f4] bg-white px-4 py-3 text-[14px] text-[#5f6773]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching current inventory...
          </div>
        ) : null}
      </div>

      {lastResult ? (
        <div className="mt-5 rounded-[18px] border border-[#dfe7f4] bg-white p-4">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6e7a8a]">
            <Sparkles className="h-4 w-4 text-primary" />
            Interpreted Filters
          </p>
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
          <p className="mt-3 text-[13px] text-[#68707c]">
            Assistant state updates with each follow-up, so short turns like
            {" "}
            <span className="font-medium text-[#30343a]">&quot;German only&quot;</span>,
            {" "}
            <span className="font-medium text-[#30343a]">&quot;actually SUV&quot;</span>,
            {" "}
            and
            {" "}
            <span className="font-medium text-[#30343a]">&quot;clear budget&quot;</span>
            {" "}
            now change the active filters directly.
          </p>

          {lastResult.clarification ? (
            <div className="mt-4 rounded-[16px] border border-[#d6e2ff] bg-[#f6f9ff] p-4">
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

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void runAssistantSearch(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: only in nakuru and automatic"
          className="h-12 flex-1 rounded-[16px] border border-[#d7dce5] bg-white px-4 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-12 rounded-[14px] bg-[#202224] px-4 text-white hover:bg-[#111315]"
          >
            Ask Assistant
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-[14px]"
            onClick={() => {
              setMessages([
                {
                  id: "assistant-intro",
                  role: "assistant",
                  content:
                    "Ask for vehicles naturally. I can narrow by body type, budget, location, seller type, and brand, then apply the result to this page.",
                },
              ]);
              setLastResult(null);
              setInput("");
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </section>
  );
}
