"use client";

import * as React from "react";
import type { ListingQualityResult } from "@/lib/types/listing-quality";
import { useWizard } from "./wizard-context";

const initialResult: ListingQualityResult = {
  score: 0,
  grade: "poor",
  headline: "Analyzing listing",
  summary: "We are checking the listing details, photos and seller information.",
  topImprovements: [],
  sellerTip: "",
  strengths: [],
  issues: [],
  provider: "rules",
  model: null,
};

function gradeTone(grade: ListingQualityResult["grade"]) {
  if (grade === "excellent") return "bg-[#eaf7ef] text-[#2f9e63]";
  if (grade === "good") return "bg-[#eef4ff] text-[#2563eb]";
  if (grade === "fair") return "bg-[#fff4e8] text-[#e28a23]";
  return "bg-[#fff0ef] text-[#f04438]";
}

export function ListingQualityPanel() {
  const { draft } = useWizard();
  const [result, setResult] = React.useState<ListingQualityResult>(initialResult);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const payload = {
      title: draft.title,
      make: draft.details.make || "",
      model: draft.details.model || "",
      year: draft.details.year ? parseInt(draft.details.year, 10) : null,
      price: draft.priceKes ? parseFloat(draft.priceKes.replace(/,/g, "")) : 0,
      mileage: draft.details.mileage ? parseInt(draft.details.mileage, 10) : null,
      bodyType: draft.details.bodyType || draft.details.bodyStyle || null,
      transmission: draft.details.transmission || null,
      fuelType: draft.details.engineType || draft.details.fuelType || null,
      description: draft.description,
      featuresCount: draft.selectedFeatureIds.length,
      imageCount: (draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length,
      cityTown: draft.cityTown,
      locationArea: draft.locationArea,
      contactName: draft.contactName,
      phoneNumber: draft.phoneNumber,
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/ai/listing-quality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to score listing quality.");
        }

        const data = (await response.json()) as ListingQualityResult;
        setResult(data);
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            ...initialResult,
            headline: "Quality analysis unavailable",
            summary: "We could not run the listing quality analysis right now.",
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [
    draft.cityTown,
    draft.contactName,
    draft.coverImageName,
    draft.description,
    draft.details.bodyStyle,
    draft.details.bodyType,
    draft.details.engineType,
    draft.details.fuelType,
    draft.details.make,
    draft.details.mileage,
    draft.details.model,
    draft.details.transmission,
    draft.details.year,
    draft.galleryImageNames.length,
    draft.locationArea,
    draft.phoneNumber,
    draft.priceKes,
    draft.selectedFeatureIds.length,
    draft.title,
  ]);

  return (
    <div className="rounded-[24px] border border-[#ededed] bg-[#faf9f7] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            Listing Quality Assistant
          </p>
          <h3 className="mt-2 font-heading text-[24px] font-semibold text-[#202224]">
            {isLoading ? "Refreshing quality feedback..." : result.headline}
          </h3>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#6d6d6d]">{result.summary}</p>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className={`rounded-full px-4 py-2 text-[13px] font-semibold ${gradeTone(result.grade)}`}>
            Quality Score: {result.score}/100
          </div>
          <p className="text-[12px] text-[#8a8a8a]">
            {result.provider === "openai"
              ? `OpenAI summary via ${result.model}`
              : result.provider === "local_llm"
                ? `Local AI summary via ${result.model}`
                : "Rule-based fallback summary"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-[#ededed] bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Top improvements</p>
          <div className="mt-3 space-y-3">
            {result.topImprovements.length > 0 ? (
              result.topImprovements.map((item) => (
                <div key={item} className="rounded-[16px] bg-[#faf9f7] px-4 py-3 text-[13px] leading-6 text-[#5f5f5f]">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-[16px] bg-[#faf9f7] px-4 py-3 text-[13px] leading-6 text-[#5f5f5f]">
                No urgent improvements identified.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#ededed] bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#9a9a9a]">Strengths</p>
          <div className="mt-3 space-y-3">
            {result.strengths.length > 0 ? (
              result.strengths.slice(0, 4).map((item) => (
                <div key={item} className="rounded-[16px] bg-[#eefaf2] px-4 py-3 text-[13px] leading-6 text-[#2f6f4c]">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-[16px] bg-[#faf9f7] px-4 py-3 text-[13px] leading-6 text-[#5f5f5f]">
                Add more complete listing details to unlock strengths.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-[#d4e4ff] bg-[#f4f8ff] px-4 py-4 text-[14px] leading-6 text-[#61708a]">
        {result.sellerTip}
      </div>
    </div>
  );
}
