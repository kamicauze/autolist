import type { ListingOverviewAssetKey } from "@/lib/utils/listing-overview";

export interface ListingCardFact {
  key: Extract<
    ListingOverviewAssetKey,
    "fuel" | "engine-size" | "body-type" | "transmission" | "mileage"
  >;
  value: string;
}

interface ListingCardFactInput {
  fuelType?: string;
  engineSize?: string;
  bodyType?: string;
  transmission?: string;
  mileage?: string;
}

export function buildListingCardFacts({
  fuelType,
  engineSize,
  bodyType,
  transmission,
  mileage,
}: ListingCardFactInput): ListingCardFact[] {
  const facts: ListingCardFact[] = [];

  if (fuelType) {
    facts.push({ key: "fuel", value: fuelType });
  }

  if (engineSize) {
    const capacity = engineSize.trim().match(/^(\d[\d,]*(?:\.\d+)?)\s*(?:cc)?$/i);
    facts.push({
      key: "engine-size",
      value: capacity ? `${capacity[1]} cc` : engineSize,
    });
  } else if (bodyType) {
    facts.push({ key: "body-type", value: bodyType });
  }

  if (transmission) {
    facts.push({ key: "transmission", value: transmission });
  }

  if (mileage) {
    facts.push({ key: "mileage", value: mileage });
  }

  return facts;
}
