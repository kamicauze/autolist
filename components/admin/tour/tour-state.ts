"use client";

/**
 * Tiny pub/sub for "module sub-state" — for example, which tab is currently
 * visible inside `/admin/cms` (homepage / pages / media).
 *
 * The tour provider subscribes here so it can pick a sub-tour whose `match`
 * predicate reads both pathname and the current sub-state.
 *
 * Usage in a page/component:
 *   const setTourState = useSetTourState();
 *   React.useEffect(() => {
 *     setTourState("cms.activeArea", activeArea);
 *   }, [activeArea, setTourState]);
 */

type Subscriber = (snapshot: Record<string, string>) => void;

const state: Record<string, string> = {};
const subscribers = new Set<Subscriber>();

export function setTourState(key: string, value: string) {
  if (state[key] === value) return;
  state[key] = value;
  subscribers.forEach((fn) => fn({ ...state }));
}

export function getTourStateSnapshot(): Record<string, string> {
  return { ...state };
}

export function subscribeToTourState(fn: Subscriber): () => void {
  subscribers.add(fn);
  // Fire once so new subscribers see the current snapshot.
  fn({ ...state });
  return () => {
    subscribers.delete(fn);
  };
}
