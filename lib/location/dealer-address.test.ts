import assert from "node:assert/strict";
import test from "node:test";
import { findDealerAddresses, getDealerAddress, toDealerAddress, type GoogleAddressComponent } from "./dealer-address";

const kenya: GoogleAddressComponent = { longText: "Kenya", shortText: "KE", types: ["country", "political"] };
const component = (longText: string, ...types: string[]) => ({ longText, shortText: longText, types: [...types, "political"] });

test("a Google place fills the address, town, county and area", () => {
  assert.deepEqual(toDealerAddress("Sample Centre", [
    { longText: "15", types: ["street_number"] },
    { longText: "Sample Road", types: ["route"] },
    component("Westlands", "sublocality_level_1", "sublocality"),
    component("Nairobi", "locality"),
    component("Nairobi County", "administrative_area_level_1"),
    kenya,
  ]), { address: "Sample Centre, 15 Sample Road", town: "Nairobi", county: "Nairobi", area: "Westlands" });
});

test("a county-level place fills the county and leaves the town for manual entry", () => {
  assert.deepEqual(toDealerAddress("Kisumu County", [component("Kisumu County", "administrative_area_level_1"), kenya]), {
    address: "Kisumu County", town: "", county: "Kisumu", area: "",
  });
  assert.equal(toDealerAddress("Sample Plaza", [component("Unknown", "administrative_area_level_1"), kenya])?.county, "");
});

test("the saved area skips administrative units and places outside Kenya are rejected", () => {
  const base = [component("Nairobi", "locality"), component("Nairobi County", "administrative_area_level_1"), kenya];
  for (const unit of ["Highridge division", "Sample Ward", "Westlands Sub-County", "Sample Sub County", "Sample Location", "Sample Constituency"]) {
    assert.equal(toDealerAddress("Sample Centre", [component(unit, "sublocality_level_1"), ...base])?.area, "", unit);
    assert.equal(toDealerAddress("Sample Centre", [component(unit, "sublocality_level_1"), component("Parklands", "neighborhood"), ...base])?.area, "Parklands", unit);
  }
  assert.equal(toDealerAddress("Sample Road", [{ longText: "Sample Road", types: ["route"] }, ...base])?.address, "Sample Road");
  assert.equal(toDealerAddress("Sample Centre", [component("Kampala", "locality"), { longText: "Uganda", shortText: "UG", types: ["country"] }]), null);
  assert.equal(toDealerAddress("Sample Centre", []), null);
});

test("Google requests use the server key, Kenya bias and one session token", async (t) => {
  const session = "6f1c2a8e-4b7d-4c3e-9a1f-2d5e8b7c4a10";
  const calls: { url: string; init?: RequestInit }[] = [];
  const replies = [
    { suggestions: [
      { placePrediction: { placeId: "place_1", structuredFormat: { mainText: { text: "Sample Centre" }, secondaryText: { text: "Sample Road, Nairobi" } } } },
      { queryPrediction: { text: { text: "sample" } } },
    ] },
    { addressComponents: [component("Nairobi", "locality"), component("Nairobi County", "administrative_area_level_1"), kenya] },
  ];
  t.mock.method(globalThis, "fetch", async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(replies.shift()));
  });
  process.env.GOOGLE_PLACES_API_KEY = "sample-places-key";
  t.after(() => { delete process.env.GOOGLE_PLACES_API_KEY; });

  assert.deepEqual(await findDealerAddresses("Sample Centre", session), [
    { placeId: "place_1", label: "Sample Centre", detail: "Sample Road, Nairobi" },
  ]);
  assert.equal(calls[0].url, "https://places.googleapis.com/v1/places:autocomplete");
  assert.equal(calls[0].init?.method, "POST");
  assert.equal((calls[0].init?.headers as Record<string, string>)["X-Goog-Api-Key"], "sample-places-key");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    input: "Sample Centre", includedRegionCodes: ["ke"], languageCode: "en", sessionToken: session,
  });

  assert.deepEqual(await getDealerAddress("place_1", "Sample Centre", session), {
    address: "Sample Centre", town: "Nairobi", county: "Nairobi", area: "",
  });
  const details = new URL(calls[1].url);
  assert.equal(details.pathname, "/v1/places/place_1");
  assert.equal(details.searchParams.get("sessionToken"), session);
  assert.equal((calls[1].init?.headers as Record<string, string>)["X-Goog-FieldMask"], "addressComponents");
});

test("a missing key or a Google error fails so the form can offer manual entry", async (t) => {
  delete process.env.GOOGLE_PLACES_API_KEY;
  await assert.rejects(findDealerAddresses("Sample Centre", "6f1c2a8e-4b7d-4c3e-9a1f-2d5e8b7c4a10"), /not configured/);
  process.env.GOOGLE_PLACES_API_KEY = "sample-places-key";
  t.after(() => { delete process.env.GOOGLE_PLACES_API_KEY; });
  t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 403 }));
  await assert.rejects(getDealerAddress("place_1", "Sample Centre", "6f1c2a8e-4b7d-4c3e-9a1f-2d5e8b7c4a10"), /unavailable/);
});
