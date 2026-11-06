import assert from "node:assert/strict";
import test from "node:test";
import type { Listing } from "@/lib/types/listing";
import { scoreDuplicateCandidate } from "./duplicate-review";

test("different models need strong photo evidence to be duplicate candidates", () => {
  const note = {
    id: "note",
    make: "Nissan",
    model: "Note",
    year: 2019,
    price: 1_200_000,
    mileage: 80_000,
    seller_id: "sample-dealer",
  } as Listing;
  const advan = { ...note, id: "advan", model: "Advan" };

  assert.equal(scoreDuplicateCandidate(note, advan), null);
  assert.ok(scoreDuplicateCandidate(note, { ...advan, model: "Note" }));

  const images = [{ image_hash: "matching-hash" }] as Listing["images"];
  assert.ok(scoreDuplicateCandidate({ ...note, images }, { ...advan, images }));
});
