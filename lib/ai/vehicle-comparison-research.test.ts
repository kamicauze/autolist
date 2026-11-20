import assert from "node:assert/strict";
import { test } from "node:test";
import type { Listing } from "../types/listing";
import type { CachedVehicleResearch, VehicleResearchCache } from "../types/vehicle-comparison";

process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "test-key-for-mocked-fetch";

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: "listing-1",
    seller_id: "seller-1",
    dealer_id: null,
    status: "active",
    make: "Toyota",
    model: "Harrier",
    year: 2018,
    price: 2450000,
    currency: "KES",
    mileage: 78000,
    body_type: "SUV",
    transmission: "Automatic",
    fuel_type: "Petrol",
    color: "Black",
    condition: "foreign_used",
    seats: 5,
    doors: 5,
    drive_type: "AWD",
    is_featured: false,
    description: null,
    features: [],
    metadata: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const harrier = listing({ id: "listing-1" });
const prado = listing({ id: "listing-2", model: "Land Cruiser Prado", year: 2017, fuel_type: "Diesel" });

const cachedHarrier: CachedVehicleResearch = {
  modelSummary: "Cached Harrier summary.",
  buyerFit: "Cached buyer fit.",
  knownConsiderations: ["One", "Two", "Three"],
  researchedSpecs: [{ label: "Safety", value: "Cached safety" }],
  sources: [{ title: "Harrier source", url: "https://harrier.example/2018" }],
  model: "cached-model",
};

function memoryCache(initial: Record<string, CachedVehicleResearch>) {
  const store = new Map(Object.entries(initial));
  const puts: Parameters<VehicleResearchCache["put"]>[0] = [];
  const cache: VehicleResearchCache = {
    async get(keys) {
      return new Map(keys.flatMap((key) => (store.has(key) ? [[key, store.get(key)!] as const] : [])));
    },
    async put(entries) {
      puts.push(...entries);
    },
  };
  return { cache, puts };
}

function mockResponsesFetch(insight: Record<string, unknown>) {
  const bodies: Array<{ input: Array<{ content: string }> }> = [];
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        output: [
          {
            type: "web_search_call",
            action: { sources: [{ title: "Toyota Prado brochure", url: "https://www.toyota.example/prado-2017/" }] },
          },
          {
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify({ modelInsights: [insight] }), annotations: [] }],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;
  return bodies;
}

test("source attribution keeps only claimed URLs the search actually returned", async () => {
  const { attributeResearchSources } = await import("./vehicle-comparison");
  const attributed = attributeResearchSources(
    ["https://toyota.example/prado-2017?utm_source=openai", "https://invented.example/specs"],
    [{ title: "Brochure", url: "https://www.toyota.example/prado-2017/" }]
  );
  assert.deepEqual(attributed, [{ title: "Brochure", url: "https://www.toyota.example/prado-2017/" }]);
  assert.deepEqual(attributeResearchSources("not-an-array", []), []);
});

test("cached identities skip web research entirely", async () => {
  const { buildVehicleResearchIdentity, generateVehicleComparison } = await import("./vehicle-comparison");
  const otherHarrier = listing({ id: "listing-3", price: 2600000 });
  const { cache, puts } = memoryCache({ [buildVehicleResearchIdentity(harrier).researchKey]: cachedHarrier });
  const bodies = mockResponsesFetch({});

  const result = await generateVehicleComparison([harrier, otherHarrier], { researchCache: cache });

  assert.equal(bodies.length, 0);
  assert.equal(puts.length, 0);
  assert.equal(result.researchMode, "web");
  assert.deepEqual(result.sources, cachedHarrier.sources);
  assert.ok(result.modelInsights.every((insight) => insight.modelSummary === cachedHarrier.modelSummary));
});

test("only missing identities are researched, and only attributed sources are cached", async () => {
  const { buildVehicleResearchIdentity, generateVehicleComparison } = await import("./vehicle-comparison");
  const { cache, puts } = memoryCache({ [buildVehicleResearchIdentity(harrier).researchKey]: cachedHarrier });
  const bodies = mockResponsesFetch({
    vehicleId: "listing-2",
    modelSummary: "Fresh Prado summary.",
    buyerFit: "Fresh buyer fit.",
    knownConsiderations: ["A", "B", "C"],
    researchedSpecs: [{ label: "Drivetrain", value: "Typically 4WD" }],
    sourceUrls: ["https://toyota.example/prado-2017?utm_source=openai", "https://invented.example/specs"],
  });

  const result = await generateVehicleComparison([harrier, prado], { researchCache: cache });

  assert.equal(bodies.length, 1);
  const prompt = bodies[0].input.at(-1)?.content || "";
  assert.match(prompt, /listing-2/);
  assert.doesNotMatch(prompt, /listing-1/);

  assert.equal(result.researchMode, "web");
  assert.equal(result.modelInsights.find((item) => item.vehicleId === "listing-1")?.modelSummary, cachedHarrier.modelSummary);
  assert.equal(result.modelInsights.find((item) => item.vehicleId === "listing-2")?.modelSummary, "Fresh Prado summary.");

  assert.equal(puts.length, 1);
  assert.equal(puts[0].identity.researchKey, buildVehicleResearchIdentity(prado).researchKey);
  assert.deepEqual(puts[0].research.sources, [
    { title: "Toyota Prado brochure", url: "https://www.toyota.example/prado-2017/" },
  ]);
});
