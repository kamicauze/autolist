import type {
  PricePositioningComparable,
  PricePositioningInput,
  PricePositioningResult,
} from "@/lib/types/market-insights";

type CandidateListing = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  dealer?: {
    city: string | null;
  } | null;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function confidenceLabel(confidence: PricePositioningResult["confidence"]) {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

function getCandidateScore(candidate: CandidateListing, input: PricePositioningInput) {
  const candidateMake = normalize(candidate.make);
  const candidateModel = normalize(candidate.model);
  const candidateBody = normalize(candidate.body_type);
  const candidateTransmission = normalize(candidate.transmission);
  const candidateFuel = normalize(candidate.fuel_type);

  const inputMake = normalize(input.make);
  const inputModel = normalize(input.model);
  const inputBody = normalize(input.bodyType);
  const inputTransmission = normalize(input.transmission);
  const inputFuel = normalize(input.fuelType);

  let score = 0;

  if (candidateMake && candidateMake === inputMake) score += 28;
  if (candidateModel && candidateModel === inputModel) score += 38;
  if (candidateBody && inputBody && candidateBody === inputBody) score += 16;
  if (candidateTransmission && inputTransmission && candidateTransmission === inputTransmission) score += 8;
  if (candidateFuel && inputFuel && candidateFuel === inputFuel) score += 8;

  if (input.year && candidate.year) {
    const difference = Math.abs(candidate.year - input.year);
    if (difference === 0) score += 12;
    else if (difference === 1) score += 9;
    else if (difference <= 2) score += 6;
    else if (difference <= 4) score += 2;
  }

  if (input.mileage && candidate.mileage) {
    const mileageDifference = Math.abs(candidate.mileage - input.mileage);
    if (mileageDifference <= 10000) score += 10;
    else if (mileageDifference <= 25000) score += 7;
    else if (mileageDifference <= 50000) score += 4;
    else if (mileageDifference <= 80000) score += 2;
  }

  return score;
}

function buildBasedOnLabel(exactMatches: number, makeBodyMatches: number) {
  if (exactMatches >= 4) return "make, model and close year matches";
  if (exactMatches >= 2) return "make and model matches";
  if (makeBodyMatches >= 4) return "make and body type matches";
  return "broader active marketplace matches";
}

export function computePricePositioning(
  input: PricePositioningInput,
  candidates: CandidateListing[]
): PricePositioningResult {
  const validCandidates = candidates
    .filter((candidate) => candidate.id !== input.currentListingId)
    .filter((candidate) => Number.isFinite(candidate.price) && candidate.price > 0)
    .map((candidate) => ({
      candidate,
      score: getCandidateScore(candidate, input),
    }))
    .sort((a, b) => b.score - a.score);

  const filteredCandidates = validCandidates
    .filter(({ score }) => score >= 28)
    .slice(0, 12)
    .map(({ candidate }) => candidate);

  const exactMatches = filteredCandidates.filter(
    (candidate) =>
      normalize(candidate.make) === normalize(input.make) &&
      normalize(candidate.model) === normalize(input.model)
  ).length;
  const makeBodyMatches = filteredCandidates.filter(
    (candidate) =>
      normalize(candidate.make) === normalize(input.make) &&
      normalize(candidate.body_type) === normalize(input.bodyType)
  ).length;

  if (filteredCandidates.length < 3) {
    return {
      status: "insufficient_data",
      label: "Not enough data",
      tone: "neutral",
      note: "We need at least 3 similar active listings to estimate a reliable market range.",
      confidence: "low",
      confidenceLabel: confidenceLabel("low"),
      basedOn: "limited comparable listings",
      sampleSize: filteredCandidates.length,
      marketAverage: null,
      marketMedian: null,
      marketMin: null,
      marketMax: null,
      differenceFromMedian: null,
      percentageFromMedian: null,
      comparables: [],
    };
  }

  const prices = filteredCandidates.map((candidate) => candidate.price);
  const marketMedian = median(prices);
  const marketAverage = average(prices);
  const marketMin = Math.min(...prices);
  const marketMax = Math.max(...prices);

  if (marketMedian == null || marketAverage == null) {
    return {
      status: "insufficient_data",
      label: "Not enough data",
      tone: "neutral",
      note: "Comparable listing data is incomplete right now.",
      confidence: "low",
      confidenceLabel: confidenceLabel("low"),
      basedOn: "limited comparable listings",
      sampleSize: filteredCandidates.length,
      marketAverage: null,
      marketMedian: null,
      marketMin: null,
      marketMax: null,
      differenceFromMedian: null,
      percentageFromMedian: null,
      comparables: [],
    };
  }

  const differenceFromMedian = Math.round(input.price - marketMedian);
  const percentageFromMedian = Number(
    (((input.price - marketMedian) / Math.max(marketMedian, 1)) * 100).toFixed(1)
  );

  let status: PricePositioningResult["status"] = "fair_price";
  let label = "Fair Price";
  let tone: PricePositioningResult["tone"] = "blue";

  if (input.price < marketMedian * 0.93) {
    status = "below_market";
    label = "Below Market";
    tone = "green";
  } else if (input.price > marketMedian * 1.07) {
    status = "above_market";
    label = "Above Market";
    tone = "amber";
  }

  const confidence: PricePositioningResult["confidence"] =
    filteredCandidates.length >= 8 && exactMatches >= 4
      ? "high"
      : filteredCandidates.length >= 5
        ? "medium"
        : "low";

  const note =
    status === "below_market"
      ? `Priced ${Math.abs(percentageFromMedian)}% below the market median across ${filteredCandidates.length} similar active listings.`
      : status === "above_market"
        ? `Priced ${Math.abs(percentageFromMedian)}% above the market median across ${filteredCandidates.length} similar active listings.`
        : `Priced close to the market median across ${filteredCandidates.length} similar active listings.`;

  const comparables: PricePositioningComparable[] = filteredCandidates.slice(0, 3).map((candidate) => ({
    id: candidate.id,
    title: `${candidate.year} ${candidate.make} ${candidate.model}`,
    price: candidate.price,
    mileage: candidate.mileage,
    year: candidate.year,
    location: candidate.dealer?.city || null,
  }));

  return {
    status,
    label,
    tone,
    note,
    confidence,
    confidenceLabel: confidenceLabel(confidence),
    basedOn: buildBasedOnLabel(exactMatches, makeBodyMatches),
    sampleSize: filteredCandidates.length,
    marketAverage,
    marketMedian,
    marketMin,
    marketMax,
    differenceFromMedian,
    percentageFromMedian,
    comparables,
  };
}
