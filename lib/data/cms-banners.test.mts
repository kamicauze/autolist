import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Row = Record<string, unknown> & { id: string; category_targets: string[]; sort_order: number };
let rows: Row[] = [];
mock.module("server-only", { namedExports: {} });
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: async () => ({ from: () => {
    let limit = Infinity;
    let categoryFilter = "";
    const query = {
      select: () => query,
      eq: (column: string, value: unknown) => {
        if (column === "category_targets") categoryFilter = `category_targets.eq.${value}`;
        return query;
      },
      neq: () => query,
      or: (value: string) => { if (value.includes("category_targets")) categoryFilter = value; return query; },
      order: () => query,
      limit: (value: number) => { limit = value; return query; },
      then: (resolve: (value: unknown) => unknown) => {
        const target = categoryFilter.match(/category_targets\.cs\.\{([^}]+)\}/)?.[1];
        const selected = rows.filter((row) => !categoryFilter || row.category_targets.length === 0 || Boolean(target && row.category_targets.includes(target)));
        return Promise.resolve(resolve({ data: selected.slice(0, limit), error: null }));
      },
    };
    return query;
  } }),
} });
const { getActiveCmsBanners } = await import("./cms-banners");

function campaign(id: string, targets: string[], order: number): Row {
  return { id, title: id, category_targets: targets, sort_order: order, status: "active", desktop_image_url: "/sample.webp", starts_at: null, ends_at: null };
}

test("category targeting selects eligible campaigns before limiting results", async () => {
  rows = Array.from({ length: 24 }, (_, index) => campaign(`cars-${index}`, ["cars_vans"], index));
  rows.push(campaign("motorbike-campaign", ["motorbike"], 24));
  const result = await getActiveCmsBanners("search_top", 1, "motorbike");
  assert.deepEqual(result.map((banner) => banner.id), ["motorbike-campaign"]);
});

test("categoryless placements find global campaigns beyond targeted campaigns", async () => {
  rows = Array.from({ length: 24 }, (_, index) => campaign(`cars-${index}`, ["cars_vans"], index));
  rows.push(campaign("global-campaign", [], 24));
  const result = await getActiveCmsBanners("home_top", 1);
  assert.deepEqual(result.map((banner) => banner.id), ["global-campaign"]);
});
