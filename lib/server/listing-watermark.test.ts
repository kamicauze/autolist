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
assert.match(markup, /data-watermark-layer="pattern"/);
assert.equal(markup.includes('data-watermark-layer="corner"'), false);
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
