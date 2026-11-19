import assert from "node:assert/strict";
import { mock, test } from "node:test";

let state: unknown;
mock.module("react", { namedExports: {
  useState(initial: unknown) {
    if (state === undefined) state = initial;
    return [state, (next: unknown) => { state = next; }];
  },
} });
const { useLastSuccessfulValue } = await import("./use-last-successful-value");

test("failed refreshes retain the latest successful result and recovery replaces it", () => {
  state = undefined;
  const initial = { listings: ["vehicle-one"], total: 1 };
  const updated = { listings: ["vehicle-one", "vehicle-two"], total: 2 };
  assert.equal(useLastSuccessfulValue(initial, "guest:all"), initial);
  assert.equal(useLastSuccessfulValue(null, "guest:all"), initial);
  assert.equal(useLastSuccessfulValue(null, "guest:all"), initial);
  assert.equal(useLastSuccessfulValue(updated, "guest:all"), updated);
  assert.equal(useLastSuccessfulValue(null, "guest:all"), updated);
  const empty = { listings: [], total: 0 };
  assert.equal(useLastSuccessfulValue(empty, "guest:all"), empty);
  assert.equal(useLastSuccessfulValue(null, "guest:all"), empty);
});

test("a failed initial load has no snapshot and never reuses another user or search", () => {
  state = undefined;
  assert.equal(useLastSuccessfulValue(null, "guest:all"), null);
  const rows = ["vehicle-one"];
  assert.equal(useLastSuccessfulValue(rows, "guest:all"), rows);
  assert.equal(useLastSuccessfulValue(null, "guest:Toyota"), null);
  assert.equal(useLastSuccessfulValue(rows, "buyer:Toyota"), rows);
  assert.equal(useLastSuccessfulValue(null, "guest:Toyota"), null);
  assert.equal(useLastSuccessfulValue(null, "buyer:Toyota"), null);
});
