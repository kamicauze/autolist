import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createRequire } from "node:module";
import type { ReactElement } from "react";

let index = 0;
let states: unknown[] = [];
let effects: Array<() => void> = [];
const pushes: string[] = [];
const requests: Array<{ query: string; currentParams: unknown }> = [];
const react = createRequire(import.meta.url)("react");
mock.module("react", { defaultExport: react, namedExports: {
  ...react,
  useState(initial: unknown) {
    const slot = index++;
    if (!(slot in states)) states[slot] = typeof initial === "function" ? initial() : initial;
    return [states[slot], (value: unknown) => {
      states[slot] = typeof value === "function" ? value(states[slot]) : value;
    }];
  },
  useMemo: (callback: () => unknown) => callback(),
  useEffect: (callback: () => void) => { effects.push(callback); },
  useRef: () => ({ current: null }),
} });
mock.module("next/navigation", { namedExports: {
  useRouter: () => ({ push: (url: string) => pushes.push(url) }),
  useSearchParams: () => new URLSearchParams("make=Toyota&model=Yaris"),
} });
const { SearchAssistantPanel } = await import("./search-assistant-panel");
type Element = ReactElement<Record<string, unknown>>;
function nodes(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...nodes(element.props.children)];
}
function render(onClose?: () => void) {
  index = 0;
  effects = [];
  return SearchAssistantPanel({ onClose });
}
function click(tree: Element, label: string) {
  const button = nodes(tree).find((node) => node.props.children === label);
  assert.ok(button, `${label} must be available`);
  assert.notEqual(button.props.disabled, true);
  (button.props.onClick as () => void)();
}

test("Apply navigates to the assistant filters and closes the results overlay; Reset clears URL context", async () => {
  states = [];
  pushes.length = 0;
  requests.length = 0;
  let closed = 0;
  const fetchMock = mock.method(globalThis, "fetch", async (_url: unknown, init: RequestInit) => {
    const payload = JSON.parse(String(init.body));
    requests.push(payload);
    return Response.json({
      params: payload.currentParams, searchUrl: "/search?make=Toyota&model=Yaris",
      preview: { listings: [], total: 1 },
    });
  });
  try {
    render();
    for (const effect of effects) effect();
    await new Promise<void>((resolve) => setImmediate(resolve));
    click(render(() => closed++), "Apply To Results");
    assert.deepEqual(pushes, ["/search?make=Toyota&model=Yaris"]);
    assert.equal(closed, 1);
    click(render(), "Reset");
    const tree = render();
    const textarea = nodes(tree).find((node) => node.type === "textarea");
    assert.ok(textarea);
    (textarea.props.onChange as (event: unknown) => void)({ target: { value: "automatic" } });
    const form = nodes(render()).find((node) => node.type === "form");
    assert.ok(form);
    (form.props.onSubmit as (event: unknown) => void)({ preventDefault() {} });
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.deepEqual(requests.at(-1), { query: "automatic", currentParams: {} });
    click(render(() => closed++), "Show probable matches");
    assert.equal(closed, 2);
    assert.equal(pushes.at(-1), "/search?make=Toyota&model=Yaris");
  } finally {
    fetchMock.mock.restore();
  }
});
