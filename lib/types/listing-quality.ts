export type ListingQualityInput = {
  title: string;
  make: string;
  model: string;
  year: number | null;
  price: number;
  mileage: number | null;
  bodyType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  description: string;
  featuresCount: number;
  imageCount: number;
  cityTown: string;
  locationArea: string;
  contactName: string;
  phoneNumber: string;
};

export type ListingQualityIssue = {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type ListingQualityResult = {
  score: number;
  grade: "poor" | "fair" | "good" | "excellent";
  headline: string;
  summary: string;
  topImprovements: string[];
  sellerTip: string;
  strengths: string[];
  issues: ListingQualityIssue[];
  provider: "rules" | "local_llm" | "openai";
  model: string | null;
};
