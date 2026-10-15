import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { NextRequest } from "next/server";

type Row = Record<string, unknown>;
let user: { id: string } | null;
let role: string;
let canReadThread: boolean;
let listing: Row;
let thread: Row;
let guestThreads: Row[];
let writes: Array<{ table: string; operation: string; values: unknown }>;
let notifications: Row[];
let emails: Row[];
let emailSucceeds: boolean;

function client() {
  return {
    auth: { getUser: async () => ({ data: { user } }) },
    from(table: string) {
      let values: Row | null = null;
      const query = {
        select() { return query; },
        eq() { return query; },
        is() { return query; },
        insert(next: Row) { values = next; writes.push({ table, operation: "insert", values: next }); return query; },
        upsert(next: Row) { values = next; writes.push({ table, operation: "upsert", values: next }); return query; },
        update(next: Row) { values = next; writes.push({ table, operation: "update", values: next }); return query; },
        returns: async () => ({ data: guestThreads, error: null }),
        maybeSingle: async () => ({ data: table === "profiles" ? { role } : canReadThread ? thread : null, error: null }),
        single: async () => ({ data: table === "listings" ? listing : table === "conversation_threads" ? { id: "new-thread" } : {
          id: "new-message", thread_id: values?.thread_id, sender_id: values?.sender_id, body: values?.body,
          visibility: values?.visibility, message_type: "text", created_at: "2026-10-15T09:00:00Z", sender: [{ full_name: "Sample seller" }],
        }, error: null }),
        then(resolve: (result: { error: null }) => unknown) { return Promise.resolve({ error: null }).then(resolve); },
      };
      return query;
    },
  };
}
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => client() } });
mock.module("@/lib/supabase/admin", { namedExports: { createAdminClient: () => client() } });
mock.module("@/lib/server/notifications", { namedExports: {
  buildListingTitle: () => "2020 Sample Car",
  getMessagingHref: (_role: string, id: string) => `/dashboard/messages?thread=${id}`,
  emitNotificationEvent: async (event: Row) => { notifications.push(event); },
} });
mock.module("@/lib/server/notification-delivery", { namedExports: { getSiteBaseUrl: () => "https://staging.example.test" } });
mock.module("@/lib/server/delivery-providers", { namedExports: {
  sendProviderEmail: async (email: Row) => { emails.push(email); return { success: emailSucceeds, error: emailSucceeds ? null : "Unavailable" }; },
} });
const { POST: enquire } = await import("@/app/api/listings/[listingId]/enquiry/route");
const { POST: reply } = await import("@/app/api/messages/threads/[threadId]/messages/route");
function request(payload: Row) {
  return new NextRequest("https://staging.example.test/api/sample", { method: "POST", body: JSON.stringify(payload), headers: { "content-type": "application/json" } });
}
const enquiryParams = { params: Promise.resolve({ listingId: "sample-listing" }) };
const replyParams = { params: Promise.resolve({ threadId: "existing-thread" }) };

beforeEach(() => {
  user = null; role = "seller"; canReadThread = true; emailSucceeds = true;
  listing = { id: "sample-listing", seller_id: "seller", dealer_id: null, status: "active", sale_channel: "standard", make: "Sample", model: "Car", year: 2020 };
  thread = { id: "existing-thread", seller_id: "seller", buyer_id: null, guest_name: "Sample guest", guest_email: "guest@example.test", listing: [{ id: "sample-listing" }] };
  guestThreads = []; writes = []; notifications = []; emails = [];
});

test("guest enquiries create a seller inbox conversation and message without a support ticket", async () => {
  const response = await enquire(request({ message: "Is it available?", contactName: "Sample guest", contactEmail: " GUEST@example.test ", contactPhone: "+254 712 345678" }), enquiryParams);
  assert.equal(response.status, 200);
  assert.deepEqual(writes.map(write => write.table), ["conversation_threads", "conversation_participants", "conversation_messages"]);
  assert.equal((writes[0].values as Row).guest_email, "guest@example.test");
  assert.equal((writes[0].values as Row).guest_phone, "+254712345678");
  assert.equal((writes[2].values as Row).sender_id, null);
  assert.equal(notifications[0].threadId, "new-thread");
  assert.equal((notifications[0].deliveries as Row[])[0].href, "/dashboard/messages?thread=new-thread");
});

test("signed-in enquiries create ordinary buyer and seller participants, never support tickets", async () => {
  user = { id: "buyer" };
  assert.equal((await enquire(request({ message: "Please arrange a viewing." }), enquiryParams)).status, 200);
  assert.deepEqual(writes.map(write => write.table), ["enquiries", "conversation_threads", "conversation_participants", "conversation_messages"]);
  assert.deepEqual((writes[2].values as unknown as Row[]).map(row => row.profile_id), ["buyer", "seller"]);
});

test("returning email guests retain original contacts and recover seller participation", async () => {
  guestThreads = [{ id: "existing-thread", guest_email: "guest@example.test", guest_phone: "+254700000001" }];
  assert.equal((await enquire(request({ message: "A follow up", contactName: "New name", contactEmail: "guest@example.test", contactPhone: "+254700000002" }), enquiryParams)).status, 200);
  assert.deepEqual(writes.map(write => write.table), ["conversation_participants", "conversation_messages"]);
  assert.equal((writes[0].values as Row).thread_id, "existing-thread");
});

test("knowing a guest phone cannot change an existing email recipient or merge into their thread", async () => {
  guestThreads = [{ id: "existing-thread", guest_email: "original@example.test", guest_phone: "+254700000001" }];
  await enquire(request({ message: "Different guest", contactName: "Another guest", contactEmail: "another@example.test", contactPhone: "+254700000001" }), enquiryParams);
  assert.equal(writes[0].operation, "insert");
  assert.equal((writes[0].values as Row).guest_email, "another@example.test");
  assert.equal((writes[2].values as Row).thread_id, "new-thread");
});

test("phone-only guests reuse phone-only threads but cannot merge into email threads", async () => {
  guestThreads = [{ id: "phone-thread", guest_email: null, guest_phone: "+254700000001" }];
  const response = await enquire(request({ message: "Following up", contactName: "Sample guest", contactPhone: "+254700000001" }), enquiryParams);
  assert.match((await response.json()).message, /number you provided/);
  assert.equal((writes[0].values as Row).thread_id, "phone-thread");
});

test("private dealer-only listings never accept public enquiries through the admin client", async () => {
  listing.sale_channel = "dealer_only";
  assert.equal((await enquire(request({ message: "Hello", contactName: "Guest", contactEmail: "guest@example.test" }), enquiryParams)).status, 404);
  assert.deepEqual(writes, []);
});

test("seller replies to guest email use email and never address an absent buyer profile", async () => {
  user = { id: "seller" };
  assert.equal((await reply(request({ body: "Yes, available." }), replyParams)).status, 200);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to, "guest@example.test");
  assert.match(emails[0].text as string, /Yes, available/);
  assert.equal(notifications.length, 0);
});

test("a failed guest email remains saved and reports delivery failure truthfully", async () => {
  user = { id: "seller" }; emailSucceeds = false;
  const response = await reply(request({ body: "Available tomorrow" }), replyParams);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.body, "Available tomorrow");
  assert.match(result.deliveryWarning, /Reply saved, but the email could not be sent/);
  assert.equal(writes.length, 1);
});

test("phone-only guest replies stay saved without attempting automatic email", async () => {
  user = { id: "seller" }; thread.guest_email = null;
  assert.equal((await reply(request({ body: "Saved note" }), replyParams)).status, 200);
  assert.equal(emails.length, 0); assert.equal(notifications.length, 0);
});

test("staff-only notes never leave the conversation through email or notifications", async () => {
  user = { id: "staff-member" }; role = "support";
  for (const buyerId of [null, "buyer"]) {
    thread.buyer_id = buyerId;
    assert.equal((await reply(request({ body: "Confidential internal note" }), replyParams)).status, 200);
    assert.equal((writes.at(-1)!.values as Row).visibility, "staff_only");
  }
  assert.equal(emails.length, 0); assert.equal(notifications.length, 0);
});

test("ordinary seller replies still notify the signed-in buyer", async () => {
  user = { id: "seller" }; thread.buyer_id = "buyer";
  assert.equal((await reply(request({ body: "Available tomorrow" }), replyParams)).status, 200);
  assert.equal((notifications[0].deliveries as Row[])[0].recipientId, "buyer");
  assert.equal(emails.length, 0);
});

test("anonymous and RLS-inaccessible reply requests cannot write or deliver messages", async () => {
  assert.equal((await reply(request({ body: "Unauthorized" }), replyParams)).status, 401);
  user = { id: "unrelated-user" }; canReadThread = false;
  assert.equal((await reply(request({ body: "Unauthorized" }), replyParams)).status, 404);
  assert.deepEqual(writes, []); assert.equal(emails.length, 0); assert.equal(notifications.length, 0);
});
