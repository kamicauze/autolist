import assert from "node:assert/strict";
import {
  clearHiddenSearchFilterParams,
  parseFiniteSearchNumber,
  serializeSearchFilterParams,
} from "./search-filter-params";

const truckParams = new URLSearchParams(
  "category=truck&seats=5&page=4&engineCc=600-700"
);
truckParams.set("page", "1");
truckParams.set("axleConfig", "6x4");
truckParams.set("cabType", "Sleeper Cab");
truckParams.set("gvmMin", "18000");
truckParams.set("gvmMax", "26000");
truckParams.set("enginePowerMin", "250");
truckParams.set("enginePowerMax", "500");

clearHiddenSearchFilterParams(truckParams, "truck");

assert.equal(
  serializeSearchFilterParams(truckParams),
  "axleConfig=6x4&cabType=Sleeper+Cab&category=truck&enginePowerMax=500&enginePowerMin=250&gvmMax=26000&gvmMin=18000&page=1"
);
assert.equal(truckParams.has("seats"), false);
assert.equal(truckParams.has("engineCc"), false);

const farmParams = new URLSearchParams(
  "category=farm_agricultural&axleConfig=8x4&cabType=Day+Cab&gvmMin=12000&enginePowerMax=400&hoursMax=3000"
);
clearHiddenSearchFilterParams(farmParams, "farm_agricultural");

assert.equal(
  serializeSearchFilterParams(farmParams),
  "category=farm_agricultural&hoursMax=3000"
);

assert.equal(parseFiniteSearchNumber("18000"), 18000);
assert.equal(parseFiniteSearchNumber(["280", "999"]), 280);
assert.equal(parseFiniteSearchNumber(""), undefined);
assert.equal(parseFiniteSearchNumber("-1"), undefined);
assert.equal(parseFiniteSearchNumber("not-a-number"), undefined);
