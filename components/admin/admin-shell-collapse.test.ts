import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shellSource = readFileSync(new URL("./admin-shell.tsx", import.meta.url), "utf8");
const uiSource = readFileSync(new URL("./admin-ui.tsx", import.meta.url), "utf8");

test("admin shell supports a persistent desktop sidebar collapse", () => {
  assert.match(shellSource, /admin-sidebar-collapsed/);
  assert.match(shellSource, /Collapse admin sidebar/);
  assert.match(shellSource, /Expand admin sidebar/);
  assert.match(shellSource, /lg:w-\[84px\]/);
  assert.match(shellSource, /lg:pl-\[84px\]/);
  assert.match(shellSource, /lg:w-\[280px\]/);
  assert.match(shellSource, /lg:pl-\[280px\]/);
  assert.match(uiSource, /collapsed\?: boolean/);
  assert.match(uiSource, /lg:sr-only/);
});
