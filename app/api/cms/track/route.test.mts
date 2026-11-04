import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const bannerId = "10000000-0000-4000-8000-000000000001";
const secondBannerId = "10000000-0000-4000-8000-000000000002";
let configured = true;
let databaseError: { message: string } | null = null;
let count = 0;
const calls: { name: string; args: Record<string, unknown> }[] = [];
const client = {
  async rpc(name: string, args: Record<string, unknown>) {
    calls.push({ name, args });
    await Promise.resolve();
    if (!databaseError) count += (args.campaign_ids as string[]).length;
    return { data: null, error: databaseError };
  },
  // Reproduce the previous read/update race with two simultaneous requests.
  from() {
    let column = "";
    return {
      select(value: string) { column = value; return this; },
      eq() { return this; },
      async maybeSingle() { return { data: { [column]: count }, error: null }; },
      update(values: Record<string, number>) { count = Object.values(values)[0]; return this; },
    };
  },
};
mock.module("next/server", { namedExports: { NextResponse: Response } });
mock.module("@/lib/supabase/admin", {
  namedExports: { createOptionalAdminClient: () => configured ? client : null },
});
const { POST } = await import("./route");

function request(payload: unknown) {
  return new Request("https://marketplace.example.test/api/cms/track", {
    method: "POST", body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  configured = true;
  databaseError = null;
  count = 0;
  calls.length = 0;
});

test("simultaneous banner clicks retain both increments through the atomic RPC", async () => {
  const results = await Promise.all([
    POST(request({ type: "banner_click", id: bannerId })),
    POST(request({ type: "banner_click", id: bannerId })),
  ]);
  assert.deepEqual(results.map((response) => response.status), [200, 200]);
  assert.equal(count, 2);
  assert.equal(calls.length, 2);
});

test("one impression request records each distinct banner once", async () => {
  const response = await POST(request({
    type: "banner_impression", ids: [bannerId, secondBannerId, bannerId],
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [{
    name: "record_cms_campaign_event",
    args: { event_type: "banner_impression", campaign_ids: [bannerId, secondBannerId] },
  }]);
  assert.equal(count, 2);
});

test("offer redemptions retain the existing event contract", async () => {
  const response = await POST(request({ type: "offer_redemption", id: bannerId }));
  assert.equal(response.status, 200);
  assert.deepEqual(calls[0]?.args, { event_type: "offer_redemption", campaign_ids: [bannerId] });
});

test("invalid and malformed tracking payloads never reach persistence", async () => {
  for (const payload of [null, {}, { type: "banner_click", id: "invalid" },
    { type: "banner_impression", ids: [] },
    { type: "banner_impression", ids: Array(13).fill(bannerId) }]) {
    assert.equal((await POST(request(payload))).status, 400);
  }
  const malformed = new Request("https://marketplace.example.test/api/cms/track", { method: "POST", body: "{" });
  assert.equal((await POST(malformed)).status, 400);
  assert.equal(calls.length, 0);
});

test("missing configuration and failed persistence are not acknowledged as recorded events", async () => {
  configured = false;
  assert.equal((await POST(request({ type: "banner_click", id: bannerId }))).status, 503);
  configured = true;
  databaseError = { message: "Counter storage unavailable" };
  assert.equal((await POST(request({ type: "banner_click", id: bannerId }))).status, 503);
  assert.equal(count, 0);
});
