export type SmartSearchParams = {
  q?: string;
  make?: string;
  model?: string;
  origin?: string;
  useCase?: string;
  intent?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  driveType?: string;
  location?: string;
  sellerType?: "dealer" | "private";
};

export type SmartSearchClarificationOption = {
  label: string;
  query: string;
};

export type SmartSearchClarification = {
  question: string;
  options: SmartSearchClarificationOption[];
};

export type SmartSearchResult = {
  normalizedQuery: string;
  params: SmartSearchParams;
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
  confidence: "low" | "medium" | "high";
  note: string;
  clarification?: SmartSearchClarification | null;
  refinement?: SmartSearchClarification | null;
};
