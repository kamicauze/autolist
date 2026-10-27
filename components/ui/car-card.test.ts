import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

type Element = { type: unknown; props: Record<string, unknown> };
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("./car-card.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

function cardHarness(images: string[]) {
  let selected = 0;
  let stateIndex = 0;
  let options: unknown;
  const api = {
    scrollPrev: () => { selected = Math.max(0, selected - 1); },
    scrollNext: () => { selected = Math.min(Math.min(images.length, 4) - 1, selected + 1); },
    scrollTo: (index: number) => { selected = index; },
  };
  const componentModule = { exports: {} as { CarCard: (props: unknown) => Element } };
  vm.runInNewContext(compiled, { exports: componentModule.exports, module: componentModule, require: (name: string) => {
    if (name === "react") return {
      useState: (initial: unknown) => [stateIndex++ === 0 ? selected : initial, () => {}],
      useEffect: () => {}, useCallback: (fn: unknown) => fn,
      useRef: () => ({ current: null }), useId: () => "dealer-panel",
    };
    if (name === "react/jsx-runtime") return {
      jsx: (type: unknown, props: Element["props"]) => ({ type, props }),
      jsxs: (type: unknown, props: Element["props"]) => ({ type, props }), Fragment: "fragment",
    };
    if (name === "embla-carousel-react") return (value: unknown) => { options = value; return [null, api]; };
    if (name === "next/image") return "image";
    if (name === "next/link") return "link";
    if (name === "next/navigation") return { useRouter: () => ({ push: () => {} }) };
    if (name.endsWith("use-favorite-access")) return { useFavoriteAccess: () => false };
    if (name.endsWith("use-compare")) return { useCompare: () => ({ ids: [], isLoaded: true, isInCompare: () => false, maxItems: 4 }) };
    if (name.endsWith("listing-card-facts")) return { buildListingCardFacts: () => [] };
    if (name === "@/lib/utils") return { cn: (...values: unknown[]) => values.filter(Boolean).join(" ") };
    if (name.startsWith("@/") || name === "lucide-react") return {};
    return require(name);
  } });
  return { render: () => {
    stateIndex = 0;
    return componentModule.exports.CarCard({ id: "sample-listing", title: "Sample vehicle", bodyType: "SUV", year: 2020, price: 1000000, images, seller: { name: "Private seller" }, href: "/vehicle/sample-listing", initialIsFavorited: false });
  }, options: () => options };
}
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}
function button(tree: Element, label: string) {
  return elements(tree).find((node) => node.type === "button" && node.props["aria-label"] === label);
}
function click(node: Element | undefined) {
  assert.ok(node);
  let prevented = false;
  let stopped = false;
  (node.props.onClick as (event: { preventDefault: () => void; stopPropagation: () => void }) => void)({ preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
  assert.ok(prevented && stopped, "carousel controls must not open the listing");
}

test("listing previews stop at four photos, reveal back navigation only after first photo, and keep full-gallery link", () => {
  const harness = cardHarness(["one.jpg", "two.jpg", "three.jpg", "four.jpg", "five.jpg", "six.jpg"]);
  let tree = harness.render();
  assert.equal((harness.options() as { loop: boolean }).loop, false);
  assert.deepEqual(elements(tree).filter((node) => node.type === "image").map((node) => node.props.src), ["one.jpg", "two.jpg", "three.jpg", "four.jpg"]);
  assert.equal(button(tree, "Previous image"), undefined);
  assert.equal(button(tree, "Go to image 5"), undefined);
  click(button(tree, "Next image"));
  tree = harness.render();
  assert.ok(button(tree, "Previous image"));
  click(button(tree, "Previous image"));
  assert.equal(button(harness.render(), "Previous image"), undefined);
  click(button(harness.render(), "Go to image 4"));
  tree = harness.render();
  assert.equal(button(tree, "Next image"), undefined);
  assert.ok(button(tree, "Previous image"));
  assert.ok(elements(tree).some((node) => node.type === "span" && JSON.stringify(node.props.children) === JSON.stringify(["View all ", 6, " photos"])));
  assert.ok(elements(tree).some((node) => node.type === "link" && node.props.href === "/vehicle/sample-listing"));
});

test("empty and single-photo cards have no carousel controls; shorter galleries stop at their actual end", () => {
  for (const images of [[], ["one.jpg"]]) {
    const tree = cardHarness(images).render();
    assert.equal(button(tree, "Previous image"), undefined);
    assert.equal(button(tree, "Next image"), undefined);
    assert.equal(elements(tree).filter((node) => node.type === "image").length, 1);
  }
  const harness = cardHarness(["one.jpg", "two.jpg"]);
  click(button(harness.render(), "Next image"));
  assert.equal(button(harness.render(), "Next image"), undefined);
  assert.ok(button(harness.render(), "Previous image"));
});
