import assert from "node:assert/strict";
import test from "node:test";
import {
  buildListingMediaObjectKey,
  buildListingMediaUploadObjectKey,
  isListingMediaKeyForListing,
  isListingMediaUploadKeyForListing,
  toListingMediaUploadReference,
  validateListingMediaUploadDescriptors,
  type ListingMediaUploadDescriptor,
} from "./listing-media-upload";

function imageDescriptor(
  overrides: Partial<ListingMediaUploadDescriptor> = {}
): ListingMediaUploadDescriptor {
  return {
    clientId: "image-0",
    kind: "image",
    name: "Front View.jpg",
    size: 4 * 1024 * 1024,
    contentType: "image/jpeg",
    lastModified: 1_786_416_000_000,
    ...overrides,
  };
}

test("validates direct listing media metadata without receiving file bytes", () => {
  assert.equal(validateListingMediaUploadDescriptors([imageDescriptor()]), null);
  assert.equal(
    validateListingMediaUploadDescriptors([
      imageDescriptor({ size: 10 * 1024 * 1024 + 1 }),
    ]),
    '"Front View.jpg" exceeds the 10MB upload limit.'
  );
  assert.equal(
    validateListingMediaUploadDescriptors([
      imageDescriptor(),
      imageDescriptor({ clientId: "image-1" }),
    ]),
    '"Front View.jpg" was selected more than once.'
  );
});

test("listing media object keys are scoped by listing and media kind", () => {
  const key = buildListingMediaObjectKey(
    "listing-one",
    "image",
    "abc123",
    "Front View.jpg"
  );

  assert.equal(key, "listings/listing-one/media/image/abc123-front-view.jpg");
  assert.equal(isListingMediaKeyForListing(key, "listing-one", "image"), true);
  assert.equal(isListingMediaKeyForListing(key, "listing-two", "image"), false);
  assert.equal(isListingMediaKeyForListing(key, "listing-one", "document"), false);

  const uploadKey = buildListingMediaUploadObjectKey(
    "listing-one",
    "image",
    "abc123",
    "Front View.jpg"
  );
  assert.equal(uploadKey, "listings/listing-one/uploads/image/abc123-front-view.jpg");
  assert.equal(isListingMediaUploadKeyForListing(uploadKey, "listing-one", "image"), true);
  assert.equal(isListingMediaKeyForListing(uploadKey, "listing-one", "image"), false);
});

test("finalization references do not retain presigned bearer URLs", () => {
  const reference = toListingMediaUploadReference({
    ...imageDescriptor(),
    key: "listings/listing-one/uploads/image/abc123-front-view.jpg",
    uploadUrl: "https://example.invalid/signed-upload",
    expiresAt: "2026-08-11T09:00:00.000Z",
  });

  assert.equal("uploadUrl" in reference, false);
  assert.equal("expiresAt" in reference, false);
  assert.equal(reference.key, "listings/listing-one/uploads/image/abc123-front-view.jpg");
});
