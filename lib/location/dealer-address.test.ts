import assert from "node:assert/strict";
import test from "node:test";
import { toDealerAddress } from "./dealer-address";

test("a county-level search result fills the county", () => {
  assert.deepEqual(toDealerAddress({ countrycode: "KE", name: "Kisumu County" }), {
    address: "Kisumu County", town: "", county: "Kisumu", area: "",
  });
  assert.equal(toDealerAddress({ countrycode: "KE", name: "Kisumu", state: "Nakuru County" })?.county, "Nakuru");
  assert.equal(toDealerAddress({ countrycode: "KE", name: "Sample Plaza" })?.county, "");
});

test("the saved area prefers a suburb or neighbourhood over administrative units", () => {
  const place = { countrycode: "KE", name: "Sample Centre", city: "Nairobi", state: "Nairobi County" };
  for (const unit of ["Highridge division", "Sample Ward", "Westlands Sub-County", "Sample Sub County", "Sample Location", "Sample Constituency"]) {
    assert.equal(toDealerAddress({ ...place, district: unit })?.area, "", unit);
    assert.equal(toDealerAddress({ ...place, district: unit, locality: "Parklands" })?.area, "Parklands", unit);
  }
  assert.equal(toDealerAddress({ ...place, district: "Westlands", locality: "Parklands" })?.area, "Westlands");
  assert.equal(toDealerAddress({ ...place, locality: "Parklands" })?.area, "Parklands");
});
