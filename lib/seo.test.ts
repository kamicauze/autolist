import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { isPrivateSearchPath, publicPageMetadata, SITE_URL } from "./seo";
import robots from "../app/robots";

const originalEnvironment = process.env.VERCEL_ENV;
afterEach(() => {
  if (originalEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnvironment;
});

test("only production pages advertise indexing and canonical URLs use the live domain", () => {
  for (const environment of ["production", "preview", "development", undefined]) {
    if (environment) process.env.VERCEL_ENV = environment;
    else delete process.env.VERCEL_ENV;
    const metadata = publicPageMetadata({ title: "Toyota RAV4", description: "A public vehicle", path: "/vehicle/sample-vehicle" });
    assert.deepEqual(metadata.robots, { index: environment === "production", follow: true });
    assert.equal(metadata.alternates?.canonical, `${SITE_URL}/vehicle/sample-vehicle`);
    const rules = robots().rules;
    assert.ok(!Array.isArray(rules));
    assert.equal(rules.disallow === "/", environment !== "production");
  }
});

test("filter pages remain followable without advertising a misleading canonical", () => {
  process.env.VERCEL_ENV = "production";
  const metadata = publicPageMetadata({ title: "Vehicle search", description: "Filtered results", path: null, noIndex: true });
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.equal(metadata.alternates, undefined);
});

test("account and internal route boundaries do not accidentally match public route names", () => {
  for (const path of ["/admin", "/admin/listings/one/preview", "/dashboard/profile", "/register/dealer", "/auth/callback", "/notifications", "/api/qa/users"]) {
    assert.equal(isPrivateSearchPath(path), true, path);
  }
  for (const path of ["/", "/vehicle/one", "/dealers/one", "/blog/one", "/administrator", "/supporting-dealers"]) {
    assert.equal(isPrivateSearchPath(path), false, path);
  }
});
