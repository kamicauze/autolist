/**
 * Runs `task` over `items` with at most `limit` tasks in flight and returns
 * results in input order. After the first failure no new tasks start, but
 * tasks already in flight are awaited before rejecting, so callers can clean
 * up without racing late writes. Rejects with the lowest-index failure.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const failures: Array<{ index: number; error: unknown }> = [];
  let nextIndex = 0;

  const worker = async () => {
    while (failures.length === 0 && nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      try {
        results[currentIndex] = await task(items[currentIndex], currentIndex);
      } catch (error) {
        failures.push({ index: currentIndex, error });
      }
    }
  };

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (failures.length > 0) {
    throw failures.reduce((first, failure) => (failure.index < first.index ? failure : first)).error;
  }
  return results;
}

/** Returns a runner that lets at most `limit` tasks run at once, starting queued tasks in FIFO order. */
export function createConcurrencyLimit(limit: number) {
  const maxActive = Math.max(1, limit);
  const queue: Array<() => void> = [];
  let active = 0;

  const startNext = () => {
    if (active >= maxActive) return;
    const start = queue.shift();
    if (!start) return;
    active += 1;
    start();
  };

  return async function run<R>(task: () => Promise<R>): Promise<R> {
    await new Promise<void>((resolve) => {
      queue.push(resolve);
      startNext();
    });
    try {
      return await task();
    } finally {
      active -= 1;
      startNext();
    }
  };
}
