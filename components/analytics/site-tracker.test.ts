import assert from "node:assert/strict";
import { test } from "node:test";
import { findTrackedClick } from "./site-tracker";

type Fake = { tagName: string; dataset: Record<string, string | undefined>; textContent?: string; parent?: Fake; selectors: string[] };

function node(tagName: string, selectors: string[], dataset: Fake["dataset"] = {}, parent?: Fake, textContent?: string): Fake {
  return { tagName, selectors, dataset, parent, textContent };
}

function asElement(start: Fake) {
  const closest = (from: Fake | undefined, selector: string): unknown => {
    for (let current = from; current; current = current.parent) {
      if (current.selectors.includes(selector)) return { ...current, closest: (next: string) => closest(current, next) };
    }
    return null;
  };
  return { closest: (selector: string) => closest(start, selector) } as unknown as Element;
}

test("the nearest tagged element is counted with its target", () => {
  const button = node("BUTTON", ["[data-track]"], { track: "whatsapp_click", trackTarget: "listing-1" });
  const icon = node("svg", [], {}, button);
  assert.deepEqual(findTrackedClick(asElement(icon)), { name: "whatsapp_click", target: "listing-1" });
});

test("links inside a link group use the group event and the link text", () => {
  const footer = node("FOOTER", ["[data-track-links]"], { trackLinks: "nav_click" });
  const link = node("A", ["a[href]"], {}, footer, "Brands");
  assert.deepEqual(findTrackedClick(asElement(link)), { name: "nav_click", target: "Brands" });
});

test("clicks inside a tracked form and untagged clicks are ignored", () => {
  const form = node("FORM", ["[data-track]"], { track: "search_submit" });
  assert.equal(findTrackedClick(asElement(node("INPUT", [], {}, form))), null);
  assert.equal(findTrackedClick(asElement(node("DIV", []))), null);
  assert.equal(findTrackedClick(asElement(node("A", ["a[href]"]))), null);
});
