export type SmartSearchParams = {
  q?: string;
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  location?: string;
  sellerType?: "dealer" | "private";
};

export type SmartSearchResult = {
  normalizedQuery: string;
  params: SmartSearchParams;
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
  confidence: "low" | "medium" | "high";
  note: string;
};
