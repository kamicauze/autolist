import type { Listing } from "@/lib/types/listing";

export type DuplicateSignalSeverity = "low" | "medium" | "high";

export type DuplicateCandidate = {
  listingId: string;
  score: number;
  severity: DuplicateSignalSeverity;
  confidenceLabel: string;
  reason: string;
  distance: {
    pricePercent: number | null;
    mileageDelta: number | null;
  };
  photo: {
    matchedImages: number;
    bestDistance: number | null;
    exactHashMatch: boolean;
  };
  candidate: Pick<
    Listing,
    | "id"
    | "make"
    | "model"
    | "year"
    | "price"
    | "mileage"
    | "status"
    | "body_type"
    | "fuel_type"
    | "transmission"
    | "created_at"
    | "seller_id"
  >;
};

export type DuplicateReviewSuggestion = {
  listingId: string;
  status: "clear" | "review";
  severity: DuplicateSignalSeverity;
  headline: string;
  summary: string;
  reviewerNote: string;
  candidates: DuplicateCandidate[];
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
};
