import assert from "node:assert/strict";
import test from "node:test";
import { createConcurrencyLimit, mapWithConcurrency } from "./concurrency";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

test("keeps input order and never exceeds the limit", async () => {
  let inFlight = 0;
  let maxInFlight = 0;
  const results = await mapWithConcurrency([30, 5, 20, 1, 10], 3, async (ms, index) => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await delay(ms);
    inFlight -= 1;
    return index * 10;
  });

  assert.deepEqual(results, [0, 10, 20, 30, 40]);
  assert.equal(maxInFlight, 3);
});

test("stops starting tasks after a failure and waits for in-flight tasks", async () => {
  const started: number[] = [];
  const finished: number[] = [];

  await assert.rejects(
    mapWithConcurrency([0, 1, 2, 3, 4, 5], 2, async (index) => {
      started.push(index);
      if (index === 0) {
        await delay(5);
        throw new Error("first failed");
      }
      await delay(20);
      finished.push(index);
    }),
    /first failed/
  );

  assert.deepEqual(started, [0, 1]);
  assert.deepEqual(finished, [1]);
});

test("rejects with the lowest-index failure", async () => {
  await assert.rejects(
    mapWithConcurrency([0, 1], 2, async (index) => {
      await delay(index === 0 ? 20 : 1);
      throw new Error(`failed ${index}`);
    }),
    /failed 0/
  );
});

test("returns an empty array for no items", async () => {
  assert.deepEqual(await mapWithConcurrency([], 3, async () => 1), []);
});

test("concurrency limit runs tasks one at a time in FIFO order and releases on failure", async () => {
  const run = createConcurrencyLimit(1);
  const events: string[] = [];
  let inFlight = 0;
  let maxInFlight = 0;

  const task = (name: string, ms: number, fail = false) => run(async () => {
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    events.push(`start ${name}`);
    await delay(ms);
    inFlight -= 1;
    events.push(`end ${name}`);
    if (fail) throw new Error(`${name} failed`);
    return name;
  });

  const results = await Promise.allSettled([task("a", 15, true), task("b", 1), task("c", 5)]);

  assert.equal(maxInFlight, 1);
  assert.deepEqual(events, ["start a", "end a", "start b", "end b", "start c", "end c"]);
  assert.equal(results[0].status, "rejected");
  assert.deepEqual(results.slice(1).map((result) => result.status === "fulfilled" && result.value), ["b", "c"]);
});
