import assert from "node:assert/strict";
import { mock, test } from "node:test";
import sharp from "sharp";

const ownerId = "dealer-owner";
const existing = `dealers/${ownerId}/showroom/existing.webp`;
let role = "dealer";
let status = "APPROVED";
let updated = true;
let authorized = true;
let hasSchema = true;
const uploads: string[] = [];
const deletions: string[] = [];
const updates: unknown[] = [];
let filters: Array<[string, unknown]> = [];
const invalidations: string[] = [];
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => invalidations.push(path) } });
mock.module("@/lib/r2", { namedExports: { r2: { send: async (command: { constructor: { name: string }; input: { Key?: string; Body?: Buffer; Delete?: { Objects: Array<{ Key: string }> } } }) => {
  if (command.constructor.name === "PutObjectCommand") {
    uploads.push(command.input.Key!);
    assert.equal((await sharp(command.input.Body!).metadata()).format, "webp");
  } else deletions.push(...command.input.Delete!.Objects.map((object) => object.Key));
  return {};
} } } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: authorized ? { id: ownerId } : null } }) },
  from: (table: string) => {
    let editing = false;
    const chain = {
      select: () => chain,
      eq: (column: string, value: unknown) => { if (editing) filters.push([column, value]); return chain; },
      update: (value: unknown) => { editing = true; updates.push(value); return chain; },
      maybeSingle: async () => table === "profiles" ? { data: { role } } :
        editing ? { data: updated ? { id: "showroom-dealer" } : null, error: null } :
          { data: hasSchema ? { id: "showroom-dealer", profile_id: ownerId, status, showroom_photo_keys: [existing], updated_at: "2026-10-15T12:00:00Z" } : null, error: hasSchema ? null : { message: "column missing" } },
    };
    return chain;
  },
}) } });
const { updateMyDealerShowroom } = await import("./dealer-showroom");
process.env.R2_BUCKET_NAME = "showroom-test-bucket";
const image = await sharp({ create: { width: 40, height: 30, channels: 3, background: "green" } }).png().toBuffer();
function form(keys: string[] = []) {
  const data = new FormData(); data.set("retainedKeys", JSON.stringify(keys));
  data.append("photos", new File([new Uint8Array(image)], "showroom.png", { type: "image/png" }));
  return data;
}

test("only authenticated approved dealer owners may reach storage or mutation", async () => {
  authorized = false; assert.match((await updateMyDealerShowroom(form())).error!, /Sign in/);
  authorized = true;
  role = "seller"; assert.match((await updateMyDealerShowroom(form())).error!, /approved dealership owner/);
  role = "dealer"; status = "PENDING"; assert.match((await updateMyDealerShowroom(form())).error!, /approved dealership owner/);
  status = "APPROVED"; hasSchema = false; assert.match((await updateMyDealerShowroom(form())).error!, /not available/);
  hasSchema = true;
  assert.equal(uploads.length, 0); assert.equal(updates.length, 0);
});

test("decoded uploads are saved with ownership and version guards; removed media is cleaned", async () => {
  const result = await updateMyDealerShowroom(form());
  assert.equal(result.success, true);
  assert.equal(uploads.length, 1);
  assert.match(uploads[0], /^dealers\/dealer-owner\/showroom\/[a-f0-9-]+\.webp$/);
  assert.deepEqual(deletions, [existing]);
  assert.ok(filters.some(([key, value]) => key === "profile_id" && value === ownerId));
  assert.ok(filters.some(([key, value]) => key === "status" && value === "APPROVED"));
  assert.ok(filters.some(([key]) => key === "updated_at"));
  assert.ok(filters.some(([key, value]) => key === "showroom_photo_keys" && value === `{${existing}}`));
  assert.deepEqual(invalidations, ["/dealers/showroom-dealer", "/dashboard/profile"]);
});

test("concurrent edits remove only this attempt's new objects and preserve original photos", async () => {
  filters = []; updated = false;
  const deleteCount = deletions.length;
  const result = await updateMyDealerShowroom(form([existing]));
  assert.match(result.error!, /profile changed/);
  assert.deepEqual(deletions.slice(deleteCount), [uploads.at(-1)]);
  assert.equal(invalidations.length, 2);
  updated = true;
});
