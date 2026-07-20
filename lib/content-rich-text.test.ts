import assert from "node:assert/strict";
import { sanitizeContentHtml } from "./content-rich-text";

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
