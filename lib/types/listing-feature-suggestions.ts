import type { ListingCategory } from "@/lib/constants/marketplace";

export type ListingFeatureSuggestionInput = {
  category: ListingCategory | "";
  make: string;
  model: string;
  trim?: string | null;
  variant?: string | null;
  year?: number | null;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  equipmentType?: string | null;
};

export type ListingFeatureSuggestionResult = {
  featureIds: string[];
  provider: "rules" | "openai" | "local_llm";
  model: string | null;
  reason: string;
};
