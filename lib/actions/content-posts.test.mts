import assert from "node:assert/strict";
import { mock, test } from "node:test";

const paths: string[] = [];
let inserted: Record<string, unknown> | null = null;
const draft = {
  id: "sample-draft",
  title: "Untitled post",
  slug: "untitled-post",
  excerpt: "",
  body: "",
  status: "draft",
  category: "blog",
  subcategory: null,
  cover_image_url: null,
  gallery_image_urls: [],
  published_at: null,
  author: "Editorial Team",
  created_by: "sample-editor",
  created_at: "2026-10-15T10:00:00Z",
  updated_at: "2026-10-15T10:00:00Z",
};
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => paths.push(path) } });
mock.module("@/lib/admin/guard", {
  namedExports: {
    requireAdminAction: async () => ({
      user: { id: "sample-editor", email: "editor@example.test" },
      supabase: {
        from: (table: string) => ({
          select() { return this; },
          eq() { return this; },
          maybeSingle: async () => ({ data: table === "profiles" ? { full_name: "Editorial Team" } : null, error: null }),
          insert(values: Record<string, unknown>) { inserted = values; return this; },
          single: async () => ({ data: draft, error: null }),
        }),
      },
    }),
  },
});
const { createContentPostDraft } = await import("./content-posts");

test("new drafts contain no previous article content and invalidate their homepage placement", async () => {
  const result = await createContentPostDraft();
  assert.ok("success" in result);
  assert.deepEqual(inserted, {
    title: "Untitled post", slug: "untitled-post", excerpt: "", body: "", status: "draft",
    category: "blog", subcategory: null, cover_image_url: null, gallery_image_urls: [],
    published_at: null, author: "Editorial Team", created_by: "sample-editor",
  });
  assert.deepEqual(paths, ["/admin/blogs-content", "/", "/blog", "/blog/untitled-post"]);
});
