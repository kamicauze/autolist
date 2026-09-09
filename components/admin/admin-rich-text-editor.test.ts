import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const editorSource = readFileSync(
  new URL("./admin-rich-text-editor.tsx", import.meta.url),
  "utf8"
);
const blogEditorSource = readFileSync(
  new URL("./admin-blogs-content-live.tsx", import.meta.url),
  "utf8"
);
const rendererSource = readFileSync(
  new URL("../cms/rich-content-renderer.tsx", import.meta.url),
  "utf8"
);

assert.match(editorSource, /Place the cursor between paragraphs/);
assert.match(editorSource, />\s*Add image\s*</);
assert.match(editorSource, /data-inline-image-inspector/);
assert.match(editorSource, />\s*Replace image\s*</);
assert.match(editorSource, />\s*Remove\s*</);
assert.match(editorSource, /Alt text is required before saving/);
assert.match(editorSource, /Caption <span[^>]*>optional/);
assert.match(editorSource, /figure\.append\(image\)/);
assert.match(editorSource, /figure\.append\(figcaption\)/);
assert.match(editorSource, /moveRangeAfterContainingBlock\(range, editorElement\)/);

assert.match(blogEditorSource, /aria-label="Article draft preview"/);
assert.match(blogEditorSource, /<RichContentRenderer body=\{editor\.body\}/);
assert.match(rendererSource, /\[&_figure\]:my-7/);
assert.match(rendererSource, /\[&_figcaption\]:text-center/);
assert.match(rendererSource, /\[&_img\]:h-auto/);
