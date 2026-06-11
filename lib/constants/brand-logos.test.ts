import assert from "node:assert/strict";
import { BRAND_LOGO_BY_MAKE, getBrandLogo } from "./brand-logos";

assert.deepEqual(getBrandLogo("Toyota"), {
  src: "/brands/toyota.svg",
  colorClass: "text-[#eb0a1e]",
});

assert.equal(getBrandLogo("Mercedes-Benz").colorClass, "text-[#6b7280]");
assert.notEqual(getBrandLogo("Unknown Make").colorClass, "text-[#111827]");

assert.equal(BRAND_LOGO_BY_MAKE.BMW.colorClass, "text-[#0066b3]");
assert.equal(BRAND_LOGO_BY_MAKE.Honda.colorClass, "text-[#cc0000]");
