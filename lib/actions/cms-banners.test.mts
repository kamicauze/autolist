import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const bannerId = "4e308ace-6e34-4e54-9263-bc9d94964bb4";
const updates: Array<Record<string, unknown>> = [];
let permissionError: string | null = null;
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/admin/guard", { namedExports: {
  requireAdminAction: async () => permissionError ? { error: permissionError } : {
    user: { id: "8d65667d-9c37-4be3-bfae-d9bdc20f279a" },
    supabase: { from: () => {
      const query = {
        update: (values: Record<string, unknown>) => { updates.push(values); return query; },
        eq: () => query,
        select: () => query,
        single: async () => ({ data: { id: bannerId, ...updates.at(-1) }, error: null }),
      };
      return query;
    } },
  },
} });
mock.module("@/lib/data/cms-banners", { namedExports: {
  CMS_BANNER_SELECT: "*",
  normalizeCmsBanner: (record: Record<string, unknown>) => record,
} });
const { saveCmsBanner } = await import("./cms-banners");

const input = {
  bannerId, title: "Sample campaign", slug: "sample-campaign", placement: "search_top" as const,
  categoryTargets: [], status: "draft" as const, desktopImageUrl: "/sample-desktop.webp",
  mobileImageUrl: "", altText: "Sample creative", summary: "", body: "", ctaLabel: "",
  targetUrl: "", startsAt: "", endsAt: "", sortOrder: 0,
};
beforeEach(() => { updates.length = 0; permissionError = null; });

test("saving a banner repeatedly preserves its generated slug", async () => {
  for (const slug of ["sample-campaign", "campaign".repeat(20)]) {
    const expectedSlug = `${slug.slice(0, 120)}-4e308ace`;
    assert.equal((await saveCmsBanner({ ...input, slug })).success, true);
    assert.equal(updates.at(-1)?.slug, expectedSlug);
    assert.equal((await saveCmsBanner({ ...input, slug: expectedSlug, summary: "Updated copy" })).success, true);
    assert.equal(updates.at(-1)?.slug, expectedSlug);
  }
});

test("schedule updates require an explicit timezone and retain the intended instant", async () => {
  const ambiguous = await saveCmsBanner({ ...input, startsAt: "2026-11-05T10:30" });
  assert.equal(ambiguous.success, false);
  assert.equal(updates.length, 0);
  const explicit = await saveCmsBanner({ ...input, startsAt: "2026-11-05T10:30:00+03:00", endsAt: "2026-11-05T08:00:00Z" });
  assert.equal(explicit.success, true);
  assert.equal(updates.at(-1)?.starts_at, "2026-11-05T07:30:00.000Z");
  assert.equal(updates.at(-1)?.ends_at, "2026-11-05T08:00:00.000Z");
});

test("invalid activation, reversed schedules and non-admin saves do not write", async () => {
  for (const change of [
    { status: "active" as const, desktopImageUrl: "" },
    { startsAt: "2026-11-05T09:00:00Z", endsAt: "2026-11-05T08:00:00Z" },
  ]) assert.equal((await saveCmsBanner({ ...input, ...change })).success, false);
  permissionError = "Forbidden: Admin only.";
  assert.equal((await saveCmsBanner(input)).success, false);
  assert.equal(updates.length, 0);
});
