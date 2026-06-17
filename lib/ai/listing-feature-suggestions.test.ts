import assert from "node:assert/strict";
import {
  buildRuleListingFeatureSuggestionIdsForTest,
  suggestListingFeatureIds,
} from "./listing-feature-suggestions";
import type { ListingFeatureSuggestionInput } from "@/lib/types/listing-feature-suggestions";

const baseInput: ListingFeatureSuggestionInput = {
  category: "car",
  make: "Toyota",
  model: "Harrier",
  year: 2021,
  bodyType: "SUV",
  fuelType: "Petrol",
  transmission: "Automatic",
  trim: "",
  variant: "",
};

const ruleIds = buildRuleListingFeatureSuggestionIdsForTest(baseInput);

assert.ok(ruleIds.includes("safe_abs"));
assert.ok(ruleIds.includes("bluetooth_connectivity"));
assert.ok(ruleIds.length <= 12);

void (async () => {
  const aiResult = await suggestListingFeatureIds(baseInput, {
    generateJson: async () => ({
      data: {
        featureIds: ["safe_abs", "not_a_real_feature"],
        features: ["Apple CarPlay", "Camera System (360 deg / Surround View)"],
        reason: "Common equipment for a newer Harrier.",
      },
      provider: "openai",
      model: "test-model",
    }),
  });

  assert.equal(aiResult.provider, "openai");
  assert.equal(aiResult.model, "test-model");
  assert.deepEqual(aiResult.featureIds, [
    "safe_abs",
    "info_apple_carplay",
    "camera_system_360_deg_surround_view",
  ]);
  assert.match(aiResult.reason, /Common equipment/);

  const fallbackResult = await suggestListingFeatureIds(baseInput, {
    generateJson: async () => {
      throw new Error("AI unavailable");
    },
  });

  assert.equal(fallbackResult.provider, "rules");
  assert.deepEqual(fallbackResult.featureIds, ruleIds);
})();
