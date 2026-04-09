export type PricePositioningStatus =
  | "below_market"
  | "fair_price"
  | "above_market"
  | "insufficient_data";

export type PricePositioningComparable = {
  id: string;
  title: string;
  price: number;
  mileage: number | null;
  year: number | null;
  location: string | null;
};

export type PricePositioningInput = {
  currentListingId?: string | null;
  make: string;
  model: string;
  year?: number | null;
  price: number;
  currency?: string | null;
  mileage?: number | null;
  bodyType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
};

export type PricePositioningResult = {
  status: PricePositioningStatus;
  label: string;
  tone: "green" | "blue" | "amber" | "neutral";
  note: string;
  confidence: "high" | "medium" | "low";
  confidenceLabel: string;
  basedOn: string;
  sampleSize: number;
  marketAverage: number | null;
  marketMedian: number | null;
  marketMin: number | null;
  marketMax: number | null;
  differenceFromMedian: number | null;
  percentageFromMedian: number | null;
  comparables: PricePositioningComparable[];
};
