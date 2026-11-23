import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function previewBrowser() {
  const urls = new Map<string, Blob>();
  const images: Array<{ src: string }> = [];
  const canvases: Array<{ width: number; height: number }> = [];
  const dimensions: number[][] = [];
  let active = 0;
  let maxActive = 0;
  let decodes = 0;
  let nextUrl = 0;
  class Image {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = 8064;
    naturalHeight = 6048;
    currentSrc = "";
    constructor() { images.push(this); }
    get src() { return this.currentSrc; }
    set src(url: string) {
      this.currentSrc = url;
      if (!url) return;
      decodes++;
      active++;
      maxActive = Math.max(maxActive, active);
      const file = urls.get(url) as File;
      if (file.name.includes("portrait")) [this.naturalWidth, this.naturalHeight] = [3024, 4032];
      if (file.name.includes("small")) [this.naturalWidth, this.naturalHeight] = [320, 240];
      queueMicrotask(() => file.name.includes("broken") ? this.onerror?.() : this.onload?.());
    }
  }
  const previewModule = { exports: {} as { getListingPhotoPreview: (file: File, signal: AbortSignal) => Promise<Blob | null> } };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("./listing-photo-preview.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module: previewModule, exports: previewModule.exports, Image,
    URL: {
      createObjectURL(blob: Blob) { const url = `blob:preview-${nextUrl++}`; urls.set(url, blob); return url; },
      revokeObjectURL(url: string) { if (urls.delete(url)) active--; },
    },
    document: { createElement() {
      const canvas = {
        width: 0, height: 0,
        getContext: () => ({ drawImage() { dimensions.push([canvas.width, canvas.height]); } }),
        toBlob(callback: (blob: Blob) => void, type: string) { queueMicrotask(() => callback(new Blob(["thumbnail"], { type }))); },
      };
      canvases.push(canvas);
      return canvas;
    } },
  });
  return {
    preview: previewModule.exports.getListingPhotoPreview, dimensions, images, canvases, urls,
    get maxActive() { return maxActive; }, get decodes() { return decodes; },
  };
}

test("a batch of camera photos decodes one at a time into small previews and releases originals", async () => {
  const browser = previewBrowser();
  const files = Array.from({ length: 12 }, (_, i) => new File([`original ${i}`], `camera-${i}.jpg`, { type: "image/jpeg" }));
  const before = await Promise.all(files.map((file) => file.text()));
  const results = await Promise.all(files.map((file) => browser.preview(file, new AbortController().signal)));
  assert.equal(browser.maxActive, 1);
  assert.equal(browser.decodes, 12);
  assert.ok(results.every((blob) => blob?.type === "image/jpeg"));
  assert.deepEqual(browser.dimensions, files.map(() => [640, 480]));
  assert.equal(browser.urls.size, 0);
  assert.ok(browser.images.every((image) => image.src === ""));
  assert.ok(browser.canvases.every((canvas) => canvas.width === 0 && canvas.height === 0));
  assert.deepEqual(await Promise.all(files.map((file) => file.text())), before);
  assert.equal(await browser.preview(files[0], new AbortController().signal), results[0]);
  assert.equal(browser.decodes, 12, "review/remount reuses the small cached preview");
});

test("portrait and small imported images keep their aspect ratio, PNG transparency and size", async () => {
  const browser = previewBrowser();
  await browser.preview(new File(["portrait"], "portrait.jpg"), new AbortController().signal);
  const png = await browser.preview(new File(["small"], "small.png", { type: "image/png" }), new AbortController().signal);
  assert.deepEqual(browser.dimensions, [[480, 640], [320, 240]]);
  assert.equal(png?.type, "image/png");
});

test("cancelled and unreadable previews do not block later files or retain original URLs", async () => {
  const browser = previewBrowser();
  const controller = new AbortController();
  controller.abort();
  assert.equal(await browser.preview(new File(["cancelled"], "cancelled.jpg"), controller.signal), null);
  assert.equal(browser.decodes, 0);
  assert.equal(await browser.preview(new File(["broken"], "broken.jpg"), new AbortController().signal), null);
  const pending = new AbortController();
  const result = browser.preview(new File(["original"], "camera.jpg"), pending.signal);
  queueMicrotask(() => pending.abort());
  assert.equal(await result, null);
  assert.ok(await browser.preview(new File(["next"], "next.jpg"), new AbortController().signal));
  assert.equal(browser.urls.size, 0);
  assert.equal(browser.maxActive, 1);
});
