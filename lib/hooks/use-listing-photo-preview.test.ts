import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("preview effects revoke mounted URLs, hide stale files and ignore results after unmount", async () => {
  let state: unknown = null;
  let effect: () => () => void = () => () => {};
  const requests: Array<{ signal: AbortSignal; resolve: (blob: Blob) => void }> = [];
  const liveUrls = new Set<string>();
  let created = 0;
  const hookModule = { exports: {} as { useListingPhotoPreview: (file: File) => string | null } };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("./use-listing-photo-preview.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module: hookModule, exports: hookModule.exports, AbortController,
    URL: {
      createObjectURL() { const url = `blob:small-preview-${created++}`; liveUrls.add(url); return url; },
      revokeObjectURL(url: string) { liveUrls.delete(url); },
    },
    require(name: string) {
      if (name === "react") return {
        useState: () => [state, (next: unknown) => { state = next; }],
        useEffect: (next: typeof effect) => { effect = next; },
      };
      return { getListingPhotoPreview: (_file: File, signal: AbortSignal) =>
        new Promise<Blob>((resolve) => { requests.push({ signal, resolve }); }) };
    },
  });
  const render = hookModule.exports.useListingPhotoPreview;
  const first = new File(["original"], "front.jpg");
  assert.equal(render(first), null);
  const firstCleanup = effect();
  requests[0].resolve(new Blob(["small preview"]));
  await Promise.resolve();
  assert.equal(render(first), "blob:small-preview-0");
  assert.equal(liveUrls.size, 1);

  firstCleanup();
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(liveUrls.size, 0);
  const second = new File(["original"], "side.jpg");
  assert.equal(render(second), null, "do not show the old file while the next preview is pending");
  const secondCleanup = effect();
  secondCleanup();
  requests[1].resolve(new Blob(["late preview"]));
  await Promise.resolve();
  assert.equal(requests[1].signal.aborted, true);
  assert.equal(created, 1, "unmounted previews must not create a new URL");
  assert.equal(liveUrls.size, 0);
});
