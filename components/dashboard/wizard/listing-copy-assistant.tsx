"use client";

import * as React from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import type { ListingCopySuggestion } from "@/lib/types/listing-copy";
import { useWizard } from "./wizard-context";

type ListingCopyAssistantProps = {
  features: string[];
};

export function ListingCopyAssistant({ features }: ListingCopyAssistantProps) {
  const { draft, updateField } = useWizard();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ListingCopySuggestion | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/listing-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: draft.category,
          title: draft.title,
          description: draft.description,
          condition: draft.condition,
          price: draft.priceKes ? Number(draft.priceKes) : 0,
          cityTown: draft.cityTown,
          locationArea: draft.locationArea,
          make: draft.details.make || "",
          model: draft.details.model || "",
          year: draft.details.year ? Number(draft.details.year) : null,
          transmission: draft.details.transmission || null,
          fuelType: draft.details.engineType || draft.details.fuelType || null,
          bodyType: draft.details.bodyType || draft.details.bodyStyle || null,
          mileage: draft.details.mileage ? Number(draft.details.mileage) : null,
          color: draft.details.color || null,
          features,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate listing copy.");
      }

      const data = (await response.json()) as ListingCopySuggestion;
      setResult(data);
    } catch {
      setError("We could not generate copy suggestions right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-[#e4edff] bg-[#f7faff] p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            Copy Assistant
          </p>
          <h3 className="mt-2 font-heading text-[22px] font-semibold text-[#202224]">
            Improve title and description
          </h3>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#61708a]">
            Generate cleaner marketplace copy from the details you have already entered, then
            apply the title or description separately.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#2563eb] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4fd8] disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? "Generating..." : "Generate Suggestions"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-[16px] border border-[#ffd5d2] bg-[#fff5f4] px-4 py-3 text-[13px] text-[#b42318]">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#7a7a7a]">
            <span className="rounded-full border border-[#d9e6ff] bg-white px-3 py-1">
              {result.provider === "openai"
                ? `OpenAI via ${result.model}`
                : result.provider === "local_llm"
                  ? `Local AI via ${result.model}`
                  : "Rule-based suggestion"}
            </span>
          </div>

          <div className="rounded-[20px] border border-[#e5ecf6] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Suggested title</p>
                <p className="mt-2 text-[15px] font-semibold text-[#202224]">{result.title}</p>
              </div>
              <button
                type="button"
                onClick={() => updateField("title", result.title)}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#d9e6ff] bg-[#f7faff] px-3 py-2 text-[13px] font-semibold text-[#2563eb] hover:bg-[#eef4ff]"
              >
                <Wand2 className="h-4 w-4" />
                Apply Title
              </button>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e5ecf6] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Suggested description</p>
                <p className="mt-2 text-[14px] leading-7 text-[#4b5565]">{result.description}</p>
              </div>
              <button
                type="button"
                onClick={() => updateField("description", result.description)}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#d9e6ff] bg-[#f7faff] px-3 py-2 text-[13px] font-semibold text-[#2563eb] hover:bg-[#eef4ff]"
              >
                <Wand2 className="h-4 w-4" />
                Apply Description
              </button>
            </div>
          </div>

          {result.tips.length > 0 ? (
            <div className="rounded-[20px] border border-[#e5ecf6] bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Improvement tips</p>
              <div className="mt-3 space-y-3">
                {result.tips.map((tip) => (
                  <div
                    key={tip}
                    className="rounded-[14px] bg-[#faf9f7] px-4 py-3 text-[13px] leading-6 text-[#5f5f5f]"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
