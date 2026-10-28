import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
let calls: unknown[] = [];
let fails = false;
const compiled = ts.transpileModule(readFileSync(new URL("./listing-interactions.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sourceModule = { exports: {} as { getListingInteractionTotals: (ids: string[]) => Promise<Array<{ days: number; call_clicks: string | number; financing_clicks: string | number }> | null> } };
vm.runInNewContext(compiled, { module: sourceModule, exports: sourceModule.exports, console,
  require: (name: string) => name === "server-only" ? {} : { createOptionalAdminClient: () => ({ rpc: async (name: string, args: unknown) => { calls.push({ name, args }); return { data: [{ days: 1, call_clicks: "2", financing_clicks: "1" }], error: fails ? { message: "Unavailable" } : null }; } }) },
});
const { getListingInteractionTotals } = sourceModule.exports;
beforeEach(() => { calls = []; fails = false; });
test("reader passes only the server-scoped listing IDs to the private aggregate", async () => {
  const result = await getListingInteractionTotals(["owned-listing"]);
  assert.equal(result?.[0].call_clicks, "2");
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ name: "get_listing_interaction_totals", args: { p_listing_ids: ["owned-listing"] } }]);
});
test("no listings returns zero without querying all events; database failure is unavailable", async () => {
  const empty = await getListingInteractionTotals([]);
  assert.deepEqual(JSON.parse(JSON.stringify(empty?.map(row => [row.days, row.call_clicks, row.financing_clicks]))), [[1, 0, 0], [7, 0, 0], [30, 0, 0]]);
  assert.equal(calls.length, 0);
  fails = true;
  assert.equal(await getListingInteractionTotals(["owned-listing"]), null);
});
