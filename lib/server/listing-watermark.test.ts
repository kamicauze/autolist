import assert from "node:assert/strict";
import sharp from "sharp";
import { buildListingWatermarkSvgMarkup } from "./listing-watermark";

const markup = buildListingWatermarkSvgMarkup(960, 640);
const normalizedMarkup = markup.toLowerCase();

assert.equal(normalizedMarkup.includes("<text"), false);
assert.equal(normalizedMarkup.includes("font-family"), false);
assert.equal(normalizedMarkup.includes("font-size"), false);
assert.match(markup, /data-brand="autolist-wordmark"/);
assert.match(markup, /id="autolist-watermark"/);
assert.match(markup, /data-watermark-layer="center"/);
assert.equal(markup.includes("<pattern"), false);
assert.equal(markup.includes("rotate("), false);
assert.match(markup, /x="365"/);
assert.match(markup, /y="305"/);
assert.match(markup, /width="230"/);
assert.match(markup, /height="31"/);
assert.match(markup, /opacity="0\.16"/);
assert.equal((markup.match(/<use\b/g) ?? []).length, 1);
assert.match(markup, /fill="#FA2529"/);
assert.equal((markup.match(/data-letter=/g) ?? []).length, 8);
assert.equal((markup.match(/<path\b/g) ?? []).length, 8);

async function assertSharpRendering() {
  const rendered = await sharp(Buffer.from(markup)).png().toBuffer();
  const metadata = await sharp(rendered).metadata();

  assert.equal(metadata.width, 960);
  assert.equal(metadata.height, 640);
  assert.ok(rendered.length > 1000);
}

assertSharpRendering().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
