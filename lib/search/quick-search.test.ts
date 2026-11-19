import assert from "node:assert/strict";
import test from "node:test";
import { applyAssistantSearchTurn, parseQuickSearchRules, sanitizeSmartSearchParams } from "./quick-search";

const parse = (query: string) => sanitizeSmartSearchParams(parseQuickSearchRules(query).params);
const turn = (current: Parameters<typeof applyAssistantSearchTurn>[0], query: string) =>
  applyAssistantSearchTurn(current, query, parse(query));

test("brand-only refinements do not invent a model from conversational words", () => {
  for (const query of ["Toyota only", "Toyota please", "Toyota between 2m and 3m", "Toyota or Mazda under 3m"]) {
    assert.equal(parse(query).model, undefined, query);
  }
  assert.equal(parse("VW Golf under 2m").model, "Golf");
  assert.equal(parse("Mercedes Benz C Class in Nairobi").model, "C Class");
  assert.equal(parse("BMW 3 Series under 3m").model, "3 Series");
  assert.equal(parse("Land Rover Range Rover in Nairobi").model, "Range Rover");
  assert.equal(parse("Toyota, under 3m").make, "Toyota");
});

test("budget ranges retain both bounds and inherit a shared unit", () => {
  for (const query of ["Toyota between 2m and 3m", "Toyota from 2 to 3 million", "Toyota 2-3m", "Toyota 2m-3m", "Toyota between KSh 2,000,000 and KSh 3,000,000"]) {
    const params = parse(query);
    assert.equal(params.minPrice, "2000000", query);
    assert.equal(params.maxPrice, "3000000", query);
    assert.equal(params.model, undefined, query);
  }
  assert.equal(parse("Toyota under 2m").maxPrice, "2000000");
  assert.equal(parse("Toyota above 2m").minPrice, "2000000");
});

test("exact and directional years do not become budgets or reverse direction", () => {
  assert.deepEqual(parse("2020 Mercedes sedan"), { make: "Mercedes-Benz", minYear: "2020", maxYear: "2020", bodyType: "Sedan" });
  assert.deepEqual(parse("Toyota from 2018"), { make: "Toyota", minYear: "2018" });
  assert.deepEqual(parse("before 2018"), { maxYear: "2017" });
  assert.deepEqual(parse("2018 or newer"), { minYear: "2018" });
  assert.deepEqual(parse("2015-2018"), { minYear: "2015", maxYear: "2018" });
});

test("assistant refines the existing search until an explicit reset", () => {
  const current = { make: "Toyota", maxPrice: "3000000", location: "Nairobi" };
  assert.deepEqual(turn(current, "automatic"), { ...current, transmission: "Automatic" });
  assert.deepEqual(turn(current, "Mazda only"), { ...current, make: "Mazda" });
  for (const query of ["reset", "start over", "clear all filters"]) {
    assert.deepEqual(turn(current, query), {}, query);
  }
  assert.deepEqual(turn(current, "reset, BMW under 5m"), { make: "BMW", maxPrice: "5000000" });
});

test("clear commands remove filters without becoming search text or re-adding a parsed value", () => {
  assert.deepEqual(turn({ maxPrice: "3000000" }, "remove budget"), {});
  assert.deepEqual(turn({ make: "Toyota", maxPrice: "3000000" }, "reset budget"), { make: "Toyota" });
  assert.deepEqual(turn({ transmission: "Automatic", make: "Toyota" }, "remove automatic transmission"), { make: "Toyota" });
  assert.deepEqual(turn({ make: "Toyota", model: "Prado" }, "any make"), {});
  assert.deepEqual(turn({ minYear: "2018", maxYear: "2020" }, "before 2017"), { maxYear: "2016" });
  assert.deepEqual(turn({ location: "Nairobi" }, "not Nairobi, in Mombasa"), { location: "Mombasa" });
});

test("unstructured model searches survive both initial searches and follow-ups", () => {
  assert.deepEqual(turn({}, "Prado"), { q: "Prado" });
  assert.deepEqual(turn({ make: "Toyota", maxPrice: "3000000" }, "Prado"), { make: "Toyota", maxPrice: "3000000", q: "Prado" });
  assert.deepEqual(turn({ q: "Prado", maxPrice: "3000000" }, "SUV only"), { q: "Prado", maxPrice: "3000000", bodyType: "SUV" });
  assert.deepEqual(turn({}, "Toyota under 3m with sunroof and bluetooth"), {
    make: "Toyota", maxPrice: "3000000", q: "Bluetooth Connectivity,Sunroof",
  });
});
