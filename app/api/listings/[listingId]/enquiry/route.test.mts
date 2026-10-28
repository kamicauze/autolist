import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";

const originalEnvironment = { vercel: process.env.VERCEL_ENV, email: process.env.EMAIL_PROVIDER };
let user: { id: string } | null = null;
let listing = { id: "sample-listing", seller_id: "sample-owner", dealer_id: "sample-dealer", make: "Toyota", model: "Corolla", year: 2020, status: "active", sale_channel: "dealer_public" };
const writes: Array<{ table: string; values: Record<string, unknown> }> = [];
const events: Array<{ payload: Record<string, unknown>; actorId: string | null; deliveries: Array<{ recipientId: string; channel?: string; body: string; title: string }> }> = [];
let notificationFails = false;
const client = {
  auth: { getUser: async () => ({ data: { user } }) },
  from(table: string) {
    const chain = {
      select() { return chain; }, eq() { return chain; }, is() { return chain; },
      insert(values: Record<string, unknown>) { writes.push({ table, values }); return chain; },
      upsert(values: Record<string, unknown>) { writes.push({ table, values }); return chain; },
      returns: async () => ({ data: [], error: null }),
      single: async () => ({ data: table === "listings" ? listing : { id: table === "conversation_threads" ? "sample-thread" : "sample-message" }, error: null }),
      then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: null, error: null }).then(resolve); },
    };
    return chain;
  },
};
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client } });
mock.module("@/lib/supabase/admin", { namedExports: { createAdminClient: () => client } });
mock.module("@/lib/server/notifications", { namedExports: {
  buildListingTitle: () => "2020 Toyota Corolla",
  getMessagingHref: (_role: string, threadId: string) => `/dashboard/messages?thread=${threadId}`,
  emitNotificationEvent: async (event: typeof events[number]) => {
    events.push(event);
    if (notificationFails) throw new Error("Queue unavailable");
    return "sample-event";
  },
} });
const { POST } = await import("./route");
const financingRequest = { requestType: "financing", contactName: "  Sample buyer  ", contactPhone: "+254 700 000 001", contactEmail: "sample@example.com", monthlyIncome: "80000", downPayment: "200000.50", message: "Please discuss the available options." };
async function submit(payload: unknown) {
  const response = await POST(new Request("https://staging.example/api/listings/sample-listing/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) as never, { params: Promise.resolve({ listingId: "sample-listing" }) });
  return { status: response.status, body: await response.json() };
}
beforeEach(() => {
  process.env.VERCEL_ENV = "preview";
  process.env.EMAIL_PROVIDER = "mailtrap";
  user = null;
  listing = { ...listing, status: "active", sale_channel: "dealer_public" };
  writes.length = 0;
  events.length = 0;
  notificationFails = false;
});
after(() => {
  for (const [key, value] of [["VERCEL_ENV", originalEnvironment.vercel], ["EMAIL_PROVIDER", originalEnvironment.email]]) {
    if (value === undefined) delete process.env[key!];
    else process.env[key!] = value;
  }
});

test("guest financing uses the existing inbox, server-resolved seller and sandbox email queue", async () => {
  const result = await submit({ ...financingRequest, recipientId: "unrelated-recipient" });
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.threadId, "sample-thread");
  assert.equal(result.body.emailQueued, true);
  assert.match(result.body.message, /saved.*dashboard.*queued/);
  assert.doesNotMatch(result.body.message, /email.*sent/i);
  const thread = writes.find((write) => write.table === "conversation_threads")?.values;
  assert.equal(thread?.source, "public_listing_enquiry");
  assert.equal(thread?.seller_id, "sample-owner");
  assert.equal(thread?.guest_name, "Sample buyer");
  const message = writes.find((write) => write.table === "conversation_messages")?.values;
  for (const detail of ["Financing request", "sample@example.com", "Monthly income (KES): 80000", "Preferred down payment (KES): 200000.50", financingRequest.message]) assert.ok(String(message?.body).includes(detail));
  assert.equal(events[0].payload.kind, "financing_request");
  assert.equal(events[0].deliveries.length, 2);
  assert.ok(events[0].deliveries.every((delivery) => delivery.recipientId === "sample-owner"));
  assert.equal(events[0].deliveries[1].channel, "email");
  assert.equal(events[0].deliveries[1].body, message?.body);
});

test("signed-in financing preserves buyer threads and only queues permitted email environments", async () => {
  user = { id: "sample-buyer" };
  for (const [environment, provider, emailQueued] of [
    ["preview", "resend", false], [undefined, "resend", false], ["preview", "mailtrap", true], ["production", "resend", true],
  ] as const) {
    if (environment) process.env.VERCEL_ENV = environment;
    else delete process.env.VERCEL_ENV;
    process.env.EMAIL_PROVIDER = provider;
    writes.length = 0; events.length = 0;
    const result = await submit(financingRequest);
    assert.equal(result.body.success, true);
    assert.equal(result.body.emailQueued, emailQueued);
    assert.equal(events[0].actorId, "sample-buyer");
    assert.equal(events[0].deliveries.some((delivery) => delivery.channel === "email"), emailQueued);
    assert.equal(writes.find((write) => write.table === "conversation_threads")?.values.source, "listing_enquiry");
    if (!emailQueued) assert.match(result.body.message, /saved.*Email notification is unavailable/);
  }
});

test("financing validation and listing restrictions reject invalid requests before writes", async () => {
  for (const payload of [null, { requestType: "other" },
    ...[{ contactName: "" }, { contactName: "Sample\nBuyer" }, { contactEmail: "invalid" }, { contactPhone: "letters" }, { contactPhone: "-------" }, { contactPhone: "" }, { monthlyIncome: "-1" }, { downPayment: "1e10" }, { monthlyIncome: "1".repeat(31) }, { message: "a".repeat(2001) }].map((change) => ({ ...financingRequest, ...change })),
  ]) {
    assert.equal((await submit(payload)).status, 400);
    assert.equal(writes.length, 0);
  }
  listing.status = "draft";
  assert.equal((await submit(financingRequest)).status, 400);
  listing.status = "active"; listing.sale_channel = "dealer_only";
  assert.equal((await submit(financingRequest)).status, 404);
  listing.sale_channel = "dealer_public"; user = { id: "sample-owner" };
  assert.equal((await submit(financingRequest)).status, 400);
  assert.equal(writes.length, 0);
});

test("a notification queue failure still reports the saved financing request truthfully", async () => {
  notificationFails = true;
  const result = await submit(financingRequest);
  assert.equal(result.body.success, true);
  assert.equal(result.body.emailQueued, false);
  assert.match(result.body.message, /saved.*Email notification is unavailable/);
  assert.ok(writes.some((write) => write.table === "conversation_messages"));
  assert.doesNotMatch(JSON.stringify(result.body), /Queue unavailable/);
});

test("normal guest and signed-in enquiries retain their existing notification and message behavior", async () => {
  for (const viewer of [null, { id: "sample-buyer" }]) {
    user = viewer;
    events.length = 0; writes.length = 0;
    const result = await submit({ contactName: "Sample buyer", contactEmail: "sample@example.com", message: "Is this available?" });
    assert.equal(result.body.success, true);
    assert.equal(result.body.emailQueued, undefined);
    assert.equal(events[0].deliveries.length, 1);
    assert.equal(events[0].deliveries[0].channel, undefined);
    assert.equal(events[0].payload.kind, viewer ? "buyer_enquiry" : "public_listing_enquiry");
    assert.equal(writes.find((write) => write.table === "conversation_messages")?.values.body, "Is this available?");
  }
});
