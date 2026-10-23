import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDealerPublicLinks } from "./public-links";

test("public website and social pages require Professional or Enterprise", () => {
  const dealer = { website: "https://dealer.example", social_links: { facebook: "https://facebook.com/dealer", opening_hours: "Monday to Friday" } };
  for (const plan of [null, "basic", "unknown"]) assert.deepEqual(buildDealerPublicLinks(dealer, plan), []);
  for (const plan of ["professional", "enterprise"]) assert.deepEqual(buildDealerPublicLinks(dealer, plan).map((link) => link.label), ["Website", "Facebook"]);
});

test("legacy unsafe or invalid URLs cannot become public links", () => {
  assert.deepEqual(buildDealerPublicLinks({ website: "javascript:alert(1)", social_links: { facebook: "not a URL", instagram: " https://instagram.com/dealer ", other: "data:text/plain,example" } }, "professional"), [{ label: "Instagram", href: "https://instagram.com/dealer" }]);
});
