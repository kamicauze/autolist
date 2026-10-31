import assert from "node:assert/strict";
import { mock, test } from "node:test";

let signedIn = true;
let ownsDealer = true;
let privilegedReads = 0;
const filters: Array<[string, unknown]> = [];

mock.module("@/lib/supabase/server", {
  namedExports: { createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "pilot-owner" } : null } }) },
    from: (table: string) => {
      assert.equal(table, "dealers");
      const query = {
        select: () => query,
        eq: (column: string, value: string) => {
          assert.equal(column, "profile_id");
          assert.equal(value, "pilot-owner");
          return query;
        },
        in: () => query,
        maybeSingle: async () => ({ data: ownsDealer ? { id: "pilot-dealer", profile_id: "pilot-owner" } : null }),
      };
      return query;
    },
  }) },
});
mock.module("@/lib/supabase/admin", {
  namedExports: { createOptionalAdminClient: () => {
    privilegedReads += 1;
    return { from: (table: string) => {
      assert.equal(table, "dealer_sales_agents");
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => { filters.push([column, value]); return query; },
        order: () => query,
        returns: async () => {
          // Fail closed if a refactor removes either ownership boundary.
          assert.deepEqual(filters, [["dealer_id", "pilot-dealer"], ["profile_id", "pilot-owner"]]);
          return { data: [{ id: "pilot-agent", agent: { deactivated_at: "2026-10-31T00:00:00Z" } }], error: null };
        },
      };
      return query;
    } };
  } },
});
const { getMySalesAgents } = await import("./sales-agents");

test("private agent state is not queried without an authenticated dealership owner", async () => {
  signedIn = false;
  assert.equal((await getMySalesAgents()).error, "Unauthorized");
  signedIn = true;
  ownsDealer = false;
  assert.deepEqual((await getMySalesAgents()).agents, []);
  assert.equal(privilegedReads, 0);
});

test("an owner retains scoped agent account-state display after profile privacy is tightened", async () => {
  ownsDealer = true;
  const result = await getMySalesAgents();
  assert.equal(privilegedReads, 1);
  assert.equal(result.agents[0].account_deactivated, true);
  assert.equal(result.agents[0].id, "pilot-agent");
});
