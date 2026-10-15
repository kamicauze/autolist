import assert from "node:assert/strict";
import { mock, test } from "node:test";

const rows = [
  { id: "import", category: "import_inquiry", thread_id: null },
  { id: "insurance", category: "insurance_request", thread_id: null },
  { id: "assistance", category: "buyer_assistance", thread_id: null },
  { id: "conversation", category: "buyer_seller_chat", thread_id: "conversation-thread" },
  { id: "listing", category: "listing_enquiry", thread_id: null },
].map((row) => ({ ...row, status: "open", updated_at: "2026-10-15T12:00:00Z" }));
const client = {
  auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) },
  from(table: string) {
    let result = [...rows];
    const chain = {
      select() { return chain; }, order() { return chain; },
      eq(key: string, value: unknown) { result = result.filter((row) => row[key as keyof typeof row] === value); return chain; },
      in(key: string, values: unknown[]) { result = result.filter((row) => values.includes(row[key as keyof typeof row])); return chain; },
      is(key: string, value: unknown) { return chain.eq(key, value); },
      not(key: string, _operator: string, value: unknown) { result = result.filter((row) => row[key as keyof typeof row] !== value); return chain; },
      maybeSingle: async () => ({ data: table === "profiles" ? { id: "staff", role: "admin" } : null }),
      then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: result, error: null }).then(resolve); },
    };
    return chain;
  },
};
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => client } });
mock.module("@/lib/data/sales-agent-permissions", { namedExports: { getSalesAgentViewerContext: async () => null } });
const { getSupportQueueData } = await import("../data/messaging");

test("staff queues keep imports, assistance and escalations separate without deleting history", async () => {
  for (const [scope, expected] of [["imports", ["import"]], ["assistance", ["assistance"]], ["conversations", ["conversation"]]] as const) {
    const data = await getSupportQueueData(scope);
    assert.deepEqual(data?.tickets.map((ticket) => ticket.id), expected);
    assert.equal(data?.stats.open, 1);
  }
  assert.deepEqual((await getSupportQueueData())?.tickets.map((ticket) => ticket.id), ["import", "insurance", "assistance", "conversation"]);
});
