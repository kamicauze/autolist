import assert from "node:assert/strict";
import { mock, test } from "node:test";

let role = "buyer";
let failMessages = false;
const messageFilters: Array<[string, unknown]> = [];
const threads = ["private-latest", "public-latest", "hidden-only"].map((id) => ({
  id, listing_id: "vehicle", buyer_id: "viewer", seller_id: "viewer", status: "open",
  source: "listing_enquiry", subject: null, last_message_at: "2026-10-15T16:00:00Z",
  last_message_preview: "Private investigation note", last_message_sender_id: "staff",
  buyer: [{ id: "viewer", full_name: "Buyer" }], seller: [{ id: "viewer", full_name: "Seller" }],
  listing: [{ id: "vehicle", make: "Toyota", model: "Corolla", year: 2020 }], tickets: [],
}));
const messages = [
  { id: "visible-older", thread_id: "private-latest", body: "Public older reply", visibility: "participants", created_at: "2026-10-15T10:00:00Z", sender_id: "viewer" },
  { id: "visible-latest", thread_id: "public-latest", body: "Public latest reply", visibility: "participants", created_at: "2026-10-15T12:00:00Z", sender_id: "counterpart" },
  { id: "hidden-only-message", thread_id: "hidden-only", body: "Private investigation note", visibility: "staff_only", created_at: "2026-10-15T15:00:00Z", sender_id: "staff" },
  { id: "hidden", thread_id: "private-latest", body: "Private investigation note", visibility: "staff_only", created_at: "2026-10-15T16:00:00Z", sender_id: "staff" },
].map((message) => ({ ...message, message_type: "text", sender: [{ full_name: "Sender" }] }));

const client = {
  auth: { getUser: async () => ({ data: { user: { id: "viewer" } } }) },
  from(table: string) {
    let data: Array<(typeof threads)[number] | (typeof messages)[number]> = table === "conversation_threads" ? [...threads] : [...messages];
    const chain = {
      select() { return chain; }, order() { return chain; }, in() { return chain; },
      eq(key: string, value: unknown) {
        if (table === "conversation_messages") {
          messageFilters.push([key, value]);
          data = data.filter((item) => item[key as keyof typeof item] === value);
        }
        return chain;
      },
      maybeSingle: async () => ({ data: { id: "viewer", role } }),
      then(resolve: (result: unknown) => unknown) {
        return Promise.resolve({ data: failMessages && table === "conversation_messages" ? null : data, error: failMessages && table === "conversation_messages" ? { message: "Unavailable" } : null }).then(resolve);
      },
    };
    return chain;
  },
};
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => client } });
mock.module("@/lib/data/sales-agent-permissions", { namedExports: { getSalesAgentViewerContext: async () => ({ principalProfileId: "viewer", permissions: ["enquiries.respond"] }) } });
const { getMessagingCenterData } = await import("./messaging");

test("all marketplace roles receive only participant messages and participant-derived summaries", async () => {
  for (role of ["buyer", "seller", "dealer", "sales_agent"]) {
    messageFilters.length = 0;
    const result = await getMessagingCenterData();
    assert.deepEqual(messageFilters, [["visibility", "participants"]]);
    assert.equal(JSON.stringify(result).includes("Private investigation note"), false);
    assert.deepEqual(result?.threads.map((thread) => thread.id), ["public-latest", "private-latest", "hidden-only"]);
    assert.equal(result?.threads[0].lastMessageAt, "2026-10-15T12:00:00Z");
    assert.equal(result?.threads[0].lastMessageSenderId, "counterpart");
    assert.equal(result?.threads[1].lastMessagePreview, "Public older reply");
    assert.equal(result?.threads[2].lastMessagePreview, null);
    assert.equal(result?.threads[2].lastMessageAt, "");
    assert.equal(result?.threads[2].lastMessageSenderId, null);
  }
});

test("staff retains access to internal messages and stored thread summaries", async () => {
  for (role of ["support", "admin", "super_admin"]) {
    messageFilters.length = 0;
    const result = await getMessagingCenterData();
    assert.deepEqual(messageFilters, []);
    assert.equal(result?.messagesByThread["private-latest"].at(-1)?.visibility, "staff_only");
    assert.equal(result?.threads[0].lastMessagePreview, "Private investigation note");
  }
});

test("failed message fetch never falls back to a private historical preview", async () => {
  role = "seller";
  failMessages = true;
  const result = await getMessagingCenterData();
  assert.ok(result?.error);
  assert.deepEqual(result?.messagesByThread, {});
  assert.ok(result?.threads.every((thread) => thread.lastMessagePreview === null && thread.lastMessageAt === "" && thread.lastMessageSenderId === null));
});
