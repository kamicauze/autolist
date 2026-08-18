import type { DealerSaleIntake } from "@/lib/validations/dealer-sale";

export type ListingSaleChannel = "standard" | "dealer_public" | "dealer_only";

export function getDealerSaleListingCondition(
  condition: DealerSaleIntake["marketCondition"],
) {
  if (condition === "Brand new") return "new" as const;
  if (condition === "Foreign used") return "foreign_used" as const;
  return "locally_used" as const;
}

export function buildDealerSaleDescription(input: DealerSaleIntake) {
  const vehicle = [input.year, input.make, input.model, input.variant]
    .filter(Boolean)
    .join(" ");
  const sentences = [
    `${vehicle} submitted by a private seller in ${input.city} for dealer offers.`,
    `Seller-reported condition: ${input.condition}.`,
  ];

  if (input.notes) {
    sentences.push(input.notes.trim());
  }

  return sentences.join(" ");
}

export function buildDealerSaleSettingsNote(input: DealerSaleIntake) {
  return [
    `Reported condition: ${input.condition}`,
    `Service history: ${input.serviceHistory}`,
    `Ownership duration: ${input.ownershipDuration}`,
    `Outstanding finance: ${input.financed}`,
    `Warranty: ${input.warranty}`,
    `Ownership documents available: ${input.documents}`,
    input.registration ? `Registration: ${input.registration}` : null,
    input.notes ? `Seller notes: ${input.notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildDealerSaleMetadata(input: DealerSaleIntake) {
  return {
    category: "car",
    country: "Kenya",
    cityTown: input.city,
    locationArea: input.city,
    availability: "available",
    sellerType: "individual",
    contactName: input.fullName,
    phoneNumber: input.phone,
    contactEmail: input.email || null,
    dealerSaleRequestId: input.requestId,
    dealerSaleReportedCondition: input.condition,
    details: {
      make: input.make,
      model: input.model,
      variant: input.variant || "",
      year: String(input.year),
      mileage: String(input.mileage),
      transmission: input.transmission,
      fuelType: input.fuelType,
    },
  };
}
