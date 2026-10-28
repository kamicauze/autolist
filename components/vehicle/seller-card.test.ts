import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { getPrivateListingContact } from "../../lib/utils/listing-contact";

type Element = { type: unknown; props: Record<string, unknown> };
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("./seller-card.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

function sellerHarness(initialProps: Record<string, unknown>) {
  let stateIndex = 0;
  const states: unknown[] = [];
  const componentModule = { exports: {} as { SellerCard: (props: unknown) => Element } };
  vm.runInNewContext(compiled, {
    exports: componentModule.exports, module: componentModule,
    require: (name: string) => {
      if (name === "react") return {
        useState: (initial: unknown) => {
          const index = stateIndex++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (value: unknown) => { states[index] = value; }];
        },
        useEffect: () => {}, useRef: () => ({ current: null }),
      };
      if (name === "react/jsx-runtime") return {
        jsx: (type: unknown, props: Element["props"]) => ({ type, props }),
        jsxs: (type: unknown, props: Element["props"]) => ({ type, props }),
        Fragment: "fragment",
      };
      if (name === "next/image") return "image";
      if (name === "next/link") return "link";
      if (name.endsWith("/button")) return { Button: "button" };
      if (name.endsWith("/phone")) return { normalizeWhatsAppPhone: () => null };
      if (name.endsWith("/dealer-opening-hours")) return { parseOpeningHours: () => null };
      if (name.startsWith("@/") || name.startsWith("./") || name === "lucide-react") return {};
      return require(name);
    },
  });
  return {
    render: (overrides: Record<string, unknown> = {}) => {
      stateIndex = 0;
      return componentModule.exports.SellerCard({ listingId: "sample-listing", listingTitle: "Sample vehicle", ...initialProps, ...overrides });
    },
  };
}
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}
function telephoneLinks(tree: Element) {
  return elements(tree).filter((node) => node.type === "a" && String(node.props.href).startsWith("tel:"));
}
function revealButton(tree: Element) {
  return elements(tree).find((node) => node.type === "button" &&
    Array.isArray(node.props.children) && node.props.children.includes("Show number"));
}

test("private phone contacts are revealed before dialing and reset for a different listing or number", () => {
  const privateContact = { phoneNumber: "+254 700 000 001", whatsappNumber: null };
  const seller = sellerHarness({ privateContact });
  let tree = seller.render();
  assert.equal(telephoneLinks(tree).length, 0);
  const show = revealButton(tree);
  assert.ok(show);
  assert.equal(show.props.type, "button");
  (show.props.onClick as () => void)();
  tree = seller.render();
  assert.equal(revealButton(tree), undefined);
  const link = telephoneLinks(tree)[0];
  assert.equal(link.props.href, "tel:+254700000001");
  assert.equal(link.props["aria-label"], "Call +254 700 000 001");
  assert.ok(elements(link).some((node) => node.type === "span" && node.props.children === privateContact.phoneNumber));
  assert.equal(telephoneLinks(seller.render({ listingId: "another-listing" })).length, 0);
  assert.equal(telephoneLinks(seller.render({ privateContact: { phoneNumber: "+254700000002", whatsappNumber: null } })).length, 0);
});

test("dealer contacts retain assigned rep preference, dealer fallback, and unavailable phone privacy", () => {
  const dealer = { id: "sample-dealer", name: "Sample dealer", mobile: "+254700000002" };
  for (const [salesRep, expected] of [
    [{ name: "Sample rep", phone: "+254700000003" }, "tel:+254700000003"],
    [{ name: "Sample rep", phone: null }, "tel:+254700000002"],
    [null, "tel:+254700000002"],
  ] as const) {
    const seller = sellerHarness({ dealer, salesRep });
    const show = revealButton(seller.render());
    assert.ok(show);
    (show.props.onClick as () => void)();
    assert.equal(telephoneLinks(seller.render())[0].props.href, expected);
  }
  const hiddenContact = getPrivateListingContact({ metadata: {
    phoneNumber: "+254700000001", hidePhoneNumber: true, whatsappEnabled: false,
  } });
  for (const props of [
    { privateContact: hiddenContact },
    { privateContact: getPrivateListingContact({ metadata: { phoneNumber: "+254700000001", allowPhoneCalls: false } }) },
    { dealer: { ...dealer, mobile: undefined }, salesRep: { name: "Sample rep", phone: null } },
  ]) {
    const tree = sellerHarness(props).render();
    assert.equal(telephoneLinks(tree).length, 0);
    assert.equal(revealButton(tree)?.props.disabled, true);
  }
});
