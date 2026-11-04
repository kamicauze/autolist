import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

const bannerId = "10000000-0000-4000-8000-000000000001";
const element = {} as HTMLDivElement;
let effect: (() => void | (() => void)) | undefined;
let cleanup: (() => void) | undefined;
let intersection: IntersectionObserverCallback | undefined;
let disconnected = false;
let beaconAccepted = true;
const beacons: Blob[] = [];
const fetches: RequestInit[] = [];
const previousDescriptors = new Map<string, PropertyDescriptor | undefined>();
let page: EventTarget & { visibilityState: string };

mock.module("react", { namedExports: {
  useRef: () => ({ current: element }),
  useEffect: (callback: typeof effect) => { effect = callback; },
} });
const { trackCmsBannerClick, useCmsBannerImpressions: runImpressionHook } = await import("./cms-tracking");

function installGlobal(name: string, value: unknown) {
  previousDescriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}

function observe(isIntersecting: boolean) {
  const bounds: DOMRectReadOnly = {
    x: 0, y: 0, width: 100, height: 100,
    top: 0, right: 100, bottom: 100, left: 0,
    toJSON: () => ({}),
  };
  intersection?.([{
    target: element, isIntersecting, intersectionRatio: isIntersecting ? 0.5 : 0,
    boundingClientRect: bounds, intersectionRect: bounds, rootBounds: bounds, time: 0,
  }], {} as IntersectionObserver);
}

beforeEach(() => {
  effect = undefined;
  cleanup = undefined;
  intersection = undefined;
  disconnected = false;
  beaconAccepted = true;
  beacons.length = 0;
  fetches.length = 0;
  page = Object.assign(new EventTarget(), { visibilityState: "visible" });
  installGlobal("document", page);
  installGlobal("navigator", { sendBeacon: (_url: string, blob: Blob) => {
    beacons.push(blob);
    return beaconAccepted;
  } });
  installGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersection = callback; }
    observe(target: Element) { assert.equal(target, element); }
    disconnect() { disconnected = true; }
  });
  mock.method(globalThis, "fetch", async (_url: string | URL | Request, init: RequestInit) => {
    fetches.push(init);
    return new Response(null, { status: 200 });
  });
});

afterEach(() => {
  cleanup?.();
  mock.restoreAll();
  for (const [name, descriptor] of previousDescriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  previousDescriptors.clear();
});

function mount() {
  const ref = runImpressionHook([bannerId]);
  cleanup = effect?.() || undefined;
  return ref;
}

test("hidden or offscreen banners do not record an impression on mount", () => {
  mount();
  assert.equal(beacons.length, 0);
  observe(false);
  assert.equal(beacons.length, 0);
});

test("a visible banner records once and repeated intersection callbacks do not overcount", async () => {
  const ref = mount();
  assert.equal(ref.current, element);
  observe(true);
  observe(false);
  observe(true);
  assert.equal(beacons.length, 1);
  assert.deepEqual(JSON.parse(await beacons[0].text()), { type: "banner_impression", ids: [bannerId] });
  assert.equal(disconnected, true);
});

test("a background tab waits until it becomes visible before recording", () => {
  page.visibilityState = "hidden";
  mount();
  observe(true);
  assert.equal(beacons.length, 0);
  page.visibilityState = "visible";
  page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(beacons.length, 1);
});

test("unmount disconnects visibility observation without recording", () => {
  mount();
  cleanup?.();
  cleanup = undefined;
  assert.equal(disconnected, true);
  assert.equal(beacons.length, 0);
});

test("a rejected beacon falls back to keepalive fetch with the same event", () => {
  beaconAccepted = false;
  trackCmsBannerClick(bannerId);
  assert.equal(beacons.length, 1);
  assert.equal(fetches.length, 1);
  assert.equal(fetches[0].keepalive, true);
  assert.deepEqual(JSON.parse(String(fetches[0].body)), { type: "banner_click", id: bannerId });
});

test("an accepted beacon does not send a second request", () => {
  trackCmsBannerClick(bannerId);
  assert.equal(beacons.length, 1);
  assert.equal(fetches.length, 0);
});
