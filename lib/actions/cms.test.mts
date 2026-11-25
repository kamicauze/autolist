import assert from "node:assert/strict";
import { mock, test } from "node:test";

const writes: Array<Record<string, unknown>> = [];
mock.module("server-only", { namedExports: {} });
mock.module("next/cache", { namedExports: {
  unstable_cache: (fn: unknown) => fn, updateTag: () => {}, revalidatePath: () => {},
} });
mock.module("@/lib/supabase/server", { namedExports: { createClient: () => {} } });
mock.module("@/lib/r2", { namedExports: { r2: {} } });
mock.module("@/lib/admin/guard", { namedExports: {
  requireAdminAction: async () => ({
    user: { id: "homepage-editor" },
    supabase: { from: () => {
      let saved: Record<string, unknown> | null = null;
      const query = {
        select: () => query,
        eq: () => query,
        upsert: (payload: Record<string, unknown>) => {
          writes.push(payload);
          saved = { id: "homepage-hero", ...payload };
          return query;
        },
        maybeSingle: async () => ({ data: saved, error: null }),
      };
      return query;
    } },
  }),
} });

const { saveCmsBlock } = await import("./cms");
const { DEFAULT_HOME_HERO_CMS_CONTENT } = await import("@/lib/types/cms");

test("hero drafts and publications accept either or both text fields blank and preserve blanks on readback", async () => {
  for (const publish of [false, true]) {
    for (const [headline, subheading] of [["", ""], ["", "Support copy"], ["Headline", ""], ["  ", "  "]]) {
      const result = await saveCmsBlock({
        blockKey: "home_hero", publish,
        content: { ...DEFAULT_HOME_HERO_CMS_CONTENT, headline, subheading },
      });
      assert.equal(result.success, true);
      if (!result.success) throw new Error(result.error);
      assert.equal((result.block.draftContent as { headline: string }).headline, headline.trim());
      assert.equal((result.block.draftContent as { subheading: string }).subheading, subheading.trim());
      if (publish) assert.deepEqual(result.block.publishedContent, result.block.draftContent);
      else assert.equal(result.block.publishedContent, null);
    }
  }
});

test("optional hero text retains length limits and required image validation", async () => {
  writes.length = 0;
  for (const patch of [{ headline: "h".repeat(91) }, { subheading: "s".repeat(221) }, { backgroundImageUrl: "" }]) {
    const result = await saveCmsBlock({ blockKey: "home_hero", publish: true,
      content: { ...DEFAULT_HOME_HERO_CMS_CONTENT, headline: "", subheading: "", ...patch } });
    assert.equal(result.success, false);
  }
  assert.equal(writes.length, 0);
});
