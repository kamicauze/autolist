import assert from "node:assert/strict";
import {
  countInlineImagesWithoutAltText,
  sanitizeContentHtml,
} from "./content-rich-text";

assert.equal(
  sanitizeContentHtml('<p>Before</p><img src="/api/listing-image?key=cms%2Fbody.webp" alt="Road test"><p>After</p>'),
  '<p>Before</p><img src="/api/listing-image?key=cms%2Fbody.webp" alt="Road test"><p>After</p>'
);

assert.equal(
  sanitizeContentHtml('<img src="javascript:alert(1)" alt="Unsafe"><script>alert(1)</script>'),
  ""
);

assert.equal(
  sanitizeContentHtml('<h1>Imported heading</h1>'),
  '<h2>Imported heading</h2>'
);

const orderedFigures = sanitizeContentHtml(
  '<p>First paragraph</p><figure data-editor-id="discard"><img src="/api/listing-image?key=cms%2Ffirst.webp" alt="A silver SUV on a forest road" onerror="alert(1)"><figcaption>Road-test route near Limuru</figcaption></figure><p>Second paragraph</p><figure><img src="https://cdn.example.test/second.webp" alt="Dashboard controls"></figure><p>Final paragraph</p>'
);

assert.equal(
  orderedFigures,
  '<p>First paragraph</p><figure><img src="/api/listing-image?key=cms%2Ffirst.webp" alt="A silver SUV on a forest road"><figcaption>Road-test route near Limuru</figcaption></figure><p>Second paragraph</p><figure><img src="https://cdn.example.test/second.webp" alt="Dashboard controls"></figure><p>Final paragraph</p>'
);
assert.ok(orderedFigures.indexOf("first.webp") < orderedFigures.indexOf("second.webp"));
assert.equal(countInlineImagesWithoutAltText(orderedFigures), 0);
assert.equal(
  countInlineImagesWithoutAltText(
    '<p>Copy</p><img src="/api/listing-image?key=cms%2Fmissing.webp" alt=""><img src="/api/listing-image?key=cms%2Fdescribed.webp" alt="Cabin detail">'
  ),
  1
);

const imageWithQuery = '<figure><img src="/api/listing-image?key=cms%2Fbody.webp&variant=original" alt="Road &amp; track view"><figcaption>Road and track</figcaption></figure>';
const sanitizedImageWithQuery = sanitizeContentHtml(imageWithQuery);
assert.equal(
  sanitizedImageWithQuery,
  '<figure><img src="/api/listing-image?key=cms%2Fbody.webp&amp;variant=original" alt="Road &amp; track view"><figcaption>Road and track</figcaption></figure>'
);
assert.equal(sanitizeContentHtml(sanitizedImageWithQuery), sanitizedImageWithQuery);
