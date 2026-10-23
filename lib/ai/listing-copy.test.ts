import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingCopyInput } from "../types/listing-copy";

const vehicle: ListingCopyInput = {
  category: "car",
  title: "2018 Toyota Axio",
  description: "",
  condition: "locally_used",
  price: 1250000,
  cityTown: "Nairobi",
  locationArea: "Westlands",
  make: "Toyota",
  model: "Axio",
  year: 2018,
  transmission: "automatic",
  features: ["Air conditioning"],
};

test("rule fallback regenerates without nesting the previous description", async () => {
  process.env.AI_PROVIDER = "";
  process.env.OPENAI_API_KEY = "";
  process.env.LOCAL_LLM_ENABLED = "false";
  const { generateListingCopySuggestion } = await import("./listing-copy");
  const first = await generateListingCopySuggestion(vehicle);
  assert.equal(first.provider, "rules");
  assert.match(first.description, /2018 Toyota Axio/);
  const second = await generateListingCopySuggestion({ ...vehicle, description: first.description });
  const third = await generateListingCopySuggestion({ ...vehicle, description: second.description });
  assert.equal(second.description, first.description);
  assert.equal(third.description, first.description);

  const manual = "One owner. Complete service history available for inspection.";
  const preserved = await generateListingCopySuggestion({ ...vehicle, description: manual });
  assert.equal(preserved.description, manual);
  const fresh = await generateListingCopySuggestion({ ...vehicle, description: "", model: "Fielder" });
  assert.match(fresh.description, /Toyota Fielder/);
  assert.doesNotMatch(fresh.description, /Axio|One owner/);
});
