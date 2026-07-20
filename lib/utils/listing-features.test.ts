import assert from "node:assert/strict";
import { groupListingFeatures } from "./listing-features";

const groups = groupListingFeatures([
  "abs_anti_lock_braking_system",
  "android_auto",
  "bluetooth_connectivity",
  "active_cruise_control",
  "surround_sound_system",
  "automatic_tailgate",
  "cooled_ventilated_seats",
  "unmapped_custom_feature",
]);

assert.deepEqual(
  groups.map((group) => group.label),
  [
    "Safety",
    "Infotainment",
    "Technology & Driver Assist",
    "Audio & Visual",
    "Exterior",
    "Comfort & Convenience",
    "Other Features",
  ]
);
assert.ok(groups[0]?.features.includes("ABS (Anti-lock Braking System)"));
assert.ok(groups[1]?.features.includes("Android Auto"));
assert.ok(groups[1]?.features.includes("Bluetooth Connectivity"));
assert.ok(groups[2]?.features.includes("Active Cruise Control"));
assert.ok(groups[3]?.features.includes("Surround Sound System"));
assert.ok(groups[4]?.features.includes("Automatic Tailgate"));
assert.ok(groups[5]?.features.includes("Cooled Ventilated Seats"));
assert.ok(groups[6]?.features.includes("Unmapped Custom Feature"));
