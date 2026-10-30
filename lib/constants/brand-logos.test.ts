import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { ALL_MAKES } from "./car-data";
import { BRAND_LOGO_BY_MAKE, getBrandLogo } from "./brand-logos";

assert.deepEqual(getBrandLogo("Toyota"), {
  src: "/brands/toyota.svg",
  colorClass: "text-[#eb0a1e]",
});

assert.equal(getBrandLogo("Mercedes-Benz").colorClass, "text-[#6b7280]");
assert.notEqual(getBrandLogo("Unknown Make").colorClass, "text-[#111827]");

assert.equal(BRAND_LOGO_BY_MAKE.BMW.colorClass, "text-[#0066b3]");
assert.equal(BRAND_LOGO_BY_MAKE.Honda.colorClass, "text-[#cc0000]");


test("every supported make has a local, decodable brand logo", async () => {
  for (const make of [...ALL_MAKES, "MINI"]) {
    const { src } = getBrandLogo(make);
    assert.ok(src && src.startsWith("/brands/"), `${make} must have an actual logo`);
    const file = await readFile(resolve(process.cwd(), "public", src.slice(1)));
    if (src.endsWith(".svg")) {
      const svg = file.toString("utf8");
      assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b|\bon[a-z]+\s*=/i, make);
      assert.doesNotMatch(svg, /(?:xlink:)?href\s*=\s*["'](?!#)|url\(\s*["']?(?!#)/i, make);
    }
    const rendered = await sharp(file).resize(96, 72, { fit: "inside" }).png().toBuffer();
    assert.ok(rendered.length > 100, `${make} must render`);
  }
});

test("unknown makes retain the initials fallback", () => {
  assert.equal(getBrandLogo("Unknown Make").src, null);
});
