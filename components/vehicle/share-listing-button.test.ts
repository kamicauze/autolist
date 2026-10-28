import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

type Element = { type: unknown; props: Record<string, unknown> };
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("./share-listing-button.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

function harness(writeText?: (text: string) => Promise<void>) {
  let stateIndex = 0;
  const states: unknown[] = [];
  const selected = { focus: 0, select: 0 };
  const input = { current: { focus: () => selected.focus++, select: () => selected.select++ } };
  const componentModule = { exports: {} as { ShareListingButton: (props: unknown) => Element } };
  vm.runInNewContext(compiled, {
    exports: componentModule.exports, module: componentModule, URL,
    window: { location: { origin: "https://staging.example", search: "?private=value", hash: "#reviews" } },
    navigator: { clipboard: writeText ? { writeText } : undefined },
    require: (name: string) => {
      if (name === "react") return {
        useState: (initial: unknown) => {
          const index = stateIndex++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (value: unknown) => { states[index] = value; }];
        },
        useRef: () => input,
        useId: () => "listing-link",
      };
      if (name === "react/jsx-runtime") return {
        jsx: (type: unknown, props: Element["props"]) => ({ type, props }),
        jsxs: (type: unknown, props: Element["props"]) => ({ type, props }),
      };
      if (name === "@/components/ui/button") return { Button: "button" };
      if (name === "@/components/ui/input") return { Input: "input" };
      if (name === "@/components/ui/dialog") return Object.fromEntries(
        ["Dialog", "DialogContent", "DialogDescription", "DialogHeader", "DialogTitle", "DialogTrigger"].map((key) => [key, key])
      );
      if (name === "lucide-react") return { Copy: "copy-icon", Share2: "share-icon" };
      return require(name);
    },
  });
  return {
    render: () => {
      stateIndex = 0;
      return componentModule.exports.ShareListingButton({ listingId: "sample-listing", title: "Sample vehicle" });
    },
    selected,
  };
}
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}
function getElement(tree: Element, type: string) {
  const element = elements(tree).find((node) => node.type === type);
  assert.ok(element, `${type} must exist`);
  return element;
}
function copy(tree: Element) {
  const button = elements(tree).find((node) => node.type === "button" && node.props.onClick);
  assert.ok(button);
  (button.props.onClick as () => void)();
}

test("sharing opens a labelled dialog with a clean listing URL and confirms only successful clipboard writes", async () => {
  let finishCopy!: () => void;
  let copiedUrl = "";
  const pending = new Promise<void>((resolve) => { finishCopy = resolve; });
  const share = harness((url) => { copiedUrl = url; return pending; });
  let tree = share.render();
  assert.equal(tree.props.open, false);
  const trigger = getElement(tree, "button");
  assert.equal(trigger.props["aria-label"], "Share listing");
  (tree.props.onOpenChange as (open: boolean) => void)(true);
  tree = share.render();
  assert.equal(tree.props.open, true);
  assert.equal(getElement(tree, "input").props.value, "https://staging.example/vehicle/sample-listing");
  assert.equal(getElement(tree, "input").props.readOnly, true);
  const whatsapp = getElement(tree, "a");
  const shareUrl = new URL(whatsapp.props.href as string);
  assert.equal(shareUrl.origin, "https://wa.me");
  assert.equal(shareUrl.searchParams.get("text"), "Sample vehicle https://staging.example/vehicle/sample-listing");
  assert.equal(whatsapp.props.target, "_blank");
  assert.equal(whatsapp.props.rel, "noopener noreferrer");
  assert.equal(getElement(tree, "label").props.htmlFor, getElement(tree, "input").props.id);
  copy(tree);
  tree = share.render();
  assert.equal(copiedUrl, "https://staging.example/vehicle/sample-listing");
  assert.equal(getElement(tree, "p").props.children, "");
  assert.ok(elements(tree).some((node) => node.type === "button" && node.props.disabled === true));
  finishCopy();
  await pending;
  await new Promise<void>((resolve) => setImmediate(resolve));
  tree = share.render();
  assert.equal(getElement(tree, "p").props.children, "Link copied.");
  (tree.props.onOpenChange as (open: boolean) => void)(false);
  assert.equal(getElement(share.render(), "p").props.children, "");
});

test("unavailable or rejected clipboard access selects the link and offers manual copying without false success", async () => {
  for (const writeText of [undefined, async () => { throw new Error("Permission denied"); }]) {
    const share = harness(writeText);
    let tree = share.render();
    (tree.props.onOpenChange as (open: boolean) => void)(true);
    copy(share.render());
    await new Promise<void>((resolve) => setImmediate(resolve));
    tree = share.render();
    assert.equal(share.selected.focus, 1);
    assert.equal(share.selected.select, 1);
    assert.match(getElement(tree, "p").props.children as string, /copy it manually/);
    assert.doesNotMatch(getElement(tree, "p").props.children as string, /Link copied/);
  }
});
