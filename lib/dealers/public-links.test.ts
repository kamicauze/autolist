import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDealerPublicLinks } from "./public-links";

test("the free pilot publishes approved dealer website and social pages", () => {
  const dealer = { website: "https://dealer.example", social_links: { facebook: "https://facebook.com/dealer", opening_hours: "Monday to Friday" } };
  for (const status of ["PENDING", "REJECTED"] as const) assert.deepEqual(buildDealerPublicLinks({ ...dealer, status }), []);
  assert.deepEqual(buildDealerPublicLinks({ ...dealer, status: "APPROVED" }).map((link) => link.label), ["Website", "Facebook"]);
});

test("legacy unsafe or invalid URLs cannot become public links", () => {
  assert.deepEqual(buildDealerPublicLinks({ status: "APPROVED", website: "javascript:alert(1)", social_links: { facebook: "not a URL", instagram: " https://instagram.com/dealer ", linkedin: "https://linkedin.com@elsewhere.example", other: "data:text/plain,example" } }), [{ label: "Instagram", href: "https://instagram.com/dealer" }]);
});
