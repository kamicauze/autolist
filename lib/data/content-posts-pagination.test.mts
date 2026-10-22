import assert from "node:assert/strict";
import { mock, test } from "node:test";

type QueryCall = { orders: Array<[string, { ascending: boolean }]>; range?: number[] };
const calls: QueryCall[] = [];
let failures = 0;
mock.module("@/lib/supabase/server", { namedExports: {
  createClient: async () => ({ from: () => {
    const call: QueryCall = { orders: [] };
    calls.push(call);
    const query = {
      select: () => query,
      eq: () => query,
      not: () => query,
      lte: () => query,
      in: () => query,
      order: (field: string, options: { ascending: boolean }) => { call.orders.push([field, options]); return query; },
      range: async (start: number, end: number) => {
        call.range = [start, end];
        return failures-- > 0 ? { data: null, error: { code: "PGRST204" } } : { data: [], error: null };
      },
    };
    return query;
  } }),
} });
const { getPublishedContentPosts } = await import("./content-posts");

for (const fallbackCount of [0, 1, 2]) {
  test(`pagination uses a deterministic order and correct offset with ${fallbackCount} legacy fallbacks`, async () => {
    failures = fallbackCount;
    calls.length = 0;
    await getPublishedContentPosts(13, undefined, undefined, 12);
    assert.equal(calls.length, fallbackCount + 1);
    for (const call of calls) {
      assert.deepEqual(call.orders, [["published_at", { ascending: false }], ["id", { ascending: false }]]);
      assert.deepEqual(call.range, [12, 24]);
    }
  });
}
