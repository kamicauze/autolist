import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { LISTING_OVERVIEW_ASSET_PATHS } from "./listing-overview-assets";

interface AssetManifest {
  canvas: {
    width: number;
    height: number;
    format: string;
    alpha: boolean;
  };
  assets: Array<{
    key: string;
    file?: string;
    status: string;
  }>;
}

const publicDirectory = path.join(process.cwd(), "public");

test("every overview illustration is ready, mapped, and a transparent square PNG", async () => {
  const manifestPath = path.join(
    publicDirectory,
    "assets/vehicle-specs/manifest.json"
  );
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as AssetManifest;
  const mappedAssets = Object.entries(LISTING_OVERVIEW_ASSET_PATHS);

  assert.equal(mappedAssets.length, 17);
  assert.equal(manifest.assets.length, 17);
  assert.deepEqual(
    manifest.assets.map((asset) => asset.key).sort(),
    mappedAssets.map(([key]) => key).sort()
  );

  for (const asset of manifest.assets) {
    const expectedPath = LISTING_OVERVIEW_ASSET_PATHS[
      asset.key as keyof typeof LISTING_OVERVIEW_ASSET_PATHS
    ];

    assert.equal(asset.status, "ready", `${asset.key} is not ready`);
    assert.equal(asset.file, expectedPath, `${asset.key} has the wrong manifest path`);

    const metadata = await sharp(path.join(publicDirectory, expectedPath.slice(1))).metadata();
    assert.equal(metadata.format, manifest.canvas.format, `${asset.key} is not a PNG`);
    assert.equal(metadata.width, manifest.canvas.width, `${asset.key} has the wrong width`);
    assert.equal(metadata.height, manifest.canvas.height, `${asset.key} has the wrong height`);
    assert.equal(metadata.hasAlpha, manifest.canvas.alpha, `${asset.key} has no alpha channel`);
    assert.equal(metadata.channels, 4, `${asset.key} is not RGBA`);
  }
});
