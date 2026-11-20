import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const visitId = "30000000-0000-4000-8000-000000000001";
const visitorId = "20000000-0000-4000-8000-000000000001";
let user: { id: string } | null;
let role: string | null;
let cookie: string | undefined;
let cookieWrites: unknown[][];
let inserts: Record<string, unknown>[][];
let insertError: { message: string } | null;

mock.module("next/headers", { namedExports: {
  cookies: async () => ({
    get: () => cookie ? { value: cookie } : undefined,
    set: (...args: unknown[]) => { cookieWrites.push(args); cookie = String(args[1]); },
  }),
} });
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error: user ? null : { name: "AuthSessionMissingError" } }) } }),
} });
mock.module("@/lib/supabase/admin", { namedExports: { createOptionalAdminClient: () => ({ from: (table: string) => {
  if (table === "profiles") {
    const q = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: role ? { role } : null, error: null }) };
    return q;
  }
  return { insert: async (rows: Record<string, unknown>[]) => { inserts.push(rows); return { error: insertError }; } };
} }) } });

const { POST } = await import("./route");

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(new Request("https://autolist.co.ke/api/track", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { host: "autolist.co.ke", origin: "https://autolist.co.ke", "user-agent": "Mozilla/5.0 (iPhone) Mobile", ...headers },
  }));
}

beforeEach(() => {
  user = null; role = null; cookie = visitorId; cookieWrites = []; inserts = []; insertError = null;
});

test("public page views and known clicks are stored with server-side identity", async () => {
  const response = await post({ visitId, events: [
    { name: "page_view", path: "/vehicle/abc?email=private#x", referrer: "https://www.google.com/search?q=private" },
    { name: "whatsapp_click", path: "/vehicle/abc", target: "  listing-1  " },
  ] });
  assert.equal(response.status, 204);
  assert.deepEqual(inserts, [[
    { event_name: "page_view", path: "/vehicle/abc", target: null, referrer_origin: "https://www.google.com", visitor_id: visitorId, visit_id: visitId, signed_in: false, device: "mobile" },
    { event_name: "whatsapp_click", path: "/vehicle/abc", target: "listing-1", referrer_origin: null, visitor_id: visitorId, visit_id: visitId, signed_in: false, device: "mobile" },
  ]]);
  assert.equal(cookieWrites.length, 0);
});

test("private pages, unknown events and own-site referrers are dropped", async () => {
  await post({ visitId, events: [
    { name: "page_view", path: "/dashboard/profile" },
    { name: "drop_everything", path: "/" },
    { name: "page_view", path: "/", referrer: "https://autolist.co.ke/search?q=private" },
  ] });
  assert.equal(inserts.length, 1);
  assert.deepEqual(inserts[0].map((row) => [row.event_name, row.path, row.referrer_origin]), [["page_view", "/", null]]);
});

test("a new browser gets a random httpOnly visitor cookie", async () => {
  cookie = undefined;
  await post({ visitId, events: [{ name: "page_view", path: "/" }] });
  assert.equal(cookieWrites.length, 1);
  const [name, value, options] = cookieWrites[0] as [string, string, Record<string, unknown>];
  assert.equal(name, "al_interaction_vid");
  assert.match(value, /^[0-9a-f-]{36}$/);
  assert.equal(options.httpOnly, true);
  assert.equal(inserts[0][0].visitor_id, value);
});

test("signed-in visitors are flagged but staff and bots are not counted", async () => {
  user = { id: "profile-1" }; role = "buyer";
  await post({ visitId, events: [{ name: "page_view", path: "/" }] });
  assert.equal(inserts[0][0].signed_in, true);
  assert.equal(JSON.stringify(inserts).includes("profile-1"), false);

  inserts = []; role = "admin";
  await post({ visitId, events: [{ name: "page_view", path: "/" }] });
  user = null;
  await post({ visitId, events: [{ name: "page_view", path: "/" }] }, { "user-agent": "Googlebot/2.1" });
  assert.equal(inserts.length, 0);
});

test("cross-site and malformed requests are rejected", async () => {
  assert.equal((await post({ visitId, events: [{ name: "page_view", path: "/" }] }, { origin: "https://evil.example" })).status, 403);
  assert.equal((await post("not json")).status, 400);
  assert.equal((await post({ visitId: "nope", events: [{ name: "page_view", path: "/" }] })).status, 400);
  assert.equal((await post({ visitId, events: Array.from({ length: 21 }, () => ({ name: "page_view", path: "/" })) })).status, 400);
  assert.equal(inserts.length, 0);
});

test("database failures never reach the visitor", async () => {
  insertError = { message: "unavailable" };
  const error = mock.method(console, "error", () => {});
  assert.equal((await post({ visitId, events: [{ name: "page_view", path: "/" }] })).status, 204);
  assert.equal(error.mock.callCount(), 1);
  error.mock.restore();
});
