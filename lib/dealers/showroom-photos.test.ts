import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SHOWROOM_PHOTO_BYTES, validateShowroomPhotoSelection, isOwnedShowroomPhotoKey } from "./showroom-photos";
const owner = "dealer-owner";
const key = `dealers/${owner}/showroom/sample.webp`;
const image = { size: 1024, type: "image/jpeg" };

test("dealer media is restricted to retained keys belonging to this owner", () => {
  assert.equal(validateShowroomPhotoSelection([key], [key], [image], owner), null);
  for (const candidate of ["dealers/another-owner/showroom/sample.webp", "listings/sample.webp", `dealers/${owner}/showroom/../sample.webp`]) {
    assert.equal(isOwnedShowroomPhotoKey(candidate, owner), false);
    assert.match(validateShowroomPhotoSelection([candidate], [candidate], [], owner)!, /Refresh/);
  }
  assert.match(validateShowroomPhotoSelection([key], [], [], owner)!, /Refresh/);
  assert.match(validateShowroomPhotoSelection([key, key], [key], [], owner)!, /Refresh/);
});

test("photo limits reject unsuitable uploads but permit removing all photos", () => {
  assert.equal(validateShowroomPhotoSelection([], [key], [], owner), null);
  assert.match(validateShowroomPhotoSelection([], [], Array(6).fill(image), owner)!, /up to 5/);
  for (const file of [{ size: 0, type: image.type }, { size: MAX_SHOWROOM_PHOTO_BYTES + 1, type: image.type }, { size: 1024, type: "image/svg+xml" }]) {
    assert.match(validateShowroomPhotoSelection([], [], [file], owner)!, /5MB/);
  }
});
