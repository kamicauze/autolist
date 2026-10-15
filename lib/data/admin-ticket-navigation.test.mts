import assert from "node:assert/strict";
import { mock, test } from "node:test";
const tickets = [
  { category: "import_inquiry", thread_id: null, status: "open", priority: "medium" },
  { category: "import_inquiry", thread_id: null, status: "closed", priority: "medium" },
  { category: "buyer_assistance", thread_id: null, status: "triaged", priority: "medium" },
  { category: "seller_assistance", thread_id: null, status: "open", priority: "medium" },
  { category: "buyer_seller_chat", thread_id: "thread-sample", status: "waiting_on_seller", priority: "high" },
  { category: "insurance_request", thread_id: null, status: "open", priority: "medium" },
  { category: "public_listing_enquiry", thread_id: null, status: "open", priority: "medium" },
];
const client = { from(table: string) {
  let rows: Record<string, unknown>[] = table === "support_tickets" ? [...tickets] : [];
  const chain = {
    select() { return chain; },
    eq(key: string, value: unknown) { rows = rows.filter(row => row[key] === value); return chain; },
    neq(key: string, value: unknown) { rows = rows.filter(row => row[key] !== value); return chain; },
    is(key: string, value: unknown) { return chain.eq(key, value); },
    not(key: string, _operator: string, value: unknown) { return chain.neq(key, value); },
    in(key: string, values: unknown[]) { rows = rows.filter(row => values.includes(row[key])); return chain; },
    then(resolve: (result: unknown) => unknown) { return Promise.resolve({ count: rows.length, error: table === "insurance_requests" ? {code:"PGRST205"} : null }).then(resolve); },
  }; return chain;
} };
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => client } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
const { getAdminNavBadgeCounts } = await import("./admin");
test("admin queue badges count only their own open category and preserve escalations separately", async () => {
  const counts = await getAdminNavBadgeCounts();
  assert.equal(counts["/admin/car-inquiries"], 1);
  assert.equal(counts["/admin/inquiries-assistance"], 2);
  assert.equal(counts["/admin/conversation-tickets"], 1);
  assert.equal(counts["/admin/insurance-requests"], 1);
});
