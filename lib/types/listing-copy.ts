export type ListingCopyInput = {
  category: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  cityTown: string;
  locationArea: string;
  make: string;
  model: string;
  year: number | null;
  transmission?: string | null;
  fuelType?: string | null;
  bodyType?: string | null;
  mileage?: number | null;
  color?: string | null;
  features: string[];
};

export type ListingCopySuggestion = {
  title: string;
  description: string;
  tips: string[];
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
};
