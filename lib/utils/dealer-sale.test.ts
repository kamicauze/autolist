import assert from "node:assert/strict";
import {
  buildDealerSaleDescription,
  buildDealerSaleMetadata,
  buildDealerSaleSettingsNote,
  getDealerSaleListingCondition,
} from "./dealer-sale";
import { dealerSaleIntakeSchema } from "@/lib/validations/dealer-sale";

const intake = dealerSaleIntakeSchema.parse({
  requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  saleChannel: "dealer_only",
  year: 2021,
  make: "Toyota",
  model: "Harrier",
  variant: "Premium",
  fuelType: "Petrol",
  transmission: "Automatic",
  mileage: 72000,
  expectedPrice: 3_500_000,
  marketCondition: "Locally used",
  condition: "Good",
  serviceHistory: "Full",
  ownershipDuration: "2-5 years",
  financed: "No",
  warranty: "No",
  documents: "Yes",
  registration: "KAA 123A",
  city: "Nairobi",
  fullName: "Sample Seller",
  phone: "+254700000000",
  email: "seller@example.com",
  notes: "Minor scratch disclosed on the rear bumper.",
});

assert.equal(
  getDealerSaleListingCondition(intake.marketCondition),
  "locally_used",
);
assert.match(
  buildDealerSaleDescription(intake),
  /Seller-reported condition: Good/,
);
assert.match(buildDealerSaleSettingsNote(intake), /Outstanding finance: No/);
assert.match(buildDealerSaleSettingsNote(intake), /Registration: KAA 123A/);
assert.deepEqual(buildDealerSaleMetadata(intake), {
  category: "car",
  country: "Kenya",
  cityTown: "Nairobi",
  locationArea: "Nairobi",
  availability: "available",
  sellerType: "individual",
  contactName: "Sample Seller",
  phoneNumber: "+254700000000",
  contactEmail: "seller@example.com",
  dealerSaleRequestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  dealerSaleReportedCondition: "Good",
  details: {
    make: "Toyota",
    model: "Harrier",
    variant: "Premium",
    year: "2021",
    mileage: "72000",
    transmission: "Automatic",
    fuelType: "Petrol",
  },
});
