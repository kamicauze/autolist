import assert from "node:assert/strict";
import { test } from "node:test";
import type { Listing } from "../types/listing";
import { buildListingFacts, retrieveRelevantFaqs } from "./comms-agent-grounding";

const listing = {
  id: "listing-1",
  seller_id: "seller-1",
  dealer_id: "dealer-1",
  status: "active",
  make: "Toyota",
  model: "Prado",
  year: 2017,
  price: 6450000,
  currency: "KES",
  mileage: 98000,
  body_type: "SUV",
  transmission: "Automatic",
  fuel_type: "Diesel",
  color: null,
  condition: "locally_used",
  seats: 7,
  doors: 5,
  drive_type: "4WD",
  is_featured: false,
  description: "One owner,   full service history.",
  features: ["sunroof", "unmapped_custom_feature"],
  metadata: { cityTown: "Nairobi", locationArea: "Westlands" },
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
  dealer: { id: "dealer-1", name: "Sample Motors", logo_url: null, city: "Nairobi", address: "Ngong Road" },
} as unknown as Listing;

test("listing facts carry seller-provided values and skip empty fields", () => {
  const facts = buildListingFacts(listing);
  assert.ok(facts.includes("Vehicle: 2017 Toyota Prado"));
  assert.ok(facts.includes("Asking price: KES 6,450,000"));
  assert.ok(facts.includes("Mileage: 98,000 km"));
  assert.ok(facts.includes("Location: Westlands, Nairobi"));
  assert.ok(facts.includes("Seller: Sample Motors (dealer)"));
  assert.ok(facts.includes("Seller description: One owner, full service history."));
  assert.ok(facts.some((fact) => fact.startsWith("Seller-listed features:") && /Unmapped Custom Feature/i.test(fact)));
  assert.ok(!facts.some((fact) => fact.startsWith("Colour:")));
  assert.deepEqual(buildListingFacts(null), []);
});

test("faq retrieval returns entries that answer the buyer's question", () => {
  const questions = retrieveRelevantFaqs("Do you offer financing? Can I trade in my old car?").map(
    (faq) => faq.question
  );
  assert.ok(questions.includes("Does Autolist Kenya offer car financing?"));
  assert.ok(questions.includes("Can I trade in my current car?"));
  assert.ok(questions.length <= 3);
});

test("faq retrieval stays empty for small talk", () => {
  assert.deepEqual(retrieveRelevantFaqs("Hi, thanks!"), []);
  assert.deepEqual(retrieveRelevantFaqs("ok see you at noon"), []);
});
