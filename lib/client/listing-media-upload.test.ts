import assert from "node:assert/strict";
import test from "node:test";
import type { ListingMediaUploadTicket } from "@/lib/listing-media-upload";
import {
  LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR,
  finalizeListingImagesWithRecovery,
  uploadFilesToPresignedTargets,
} from "./listing-media-upload";

function ticket(clientId: string, name: string): ListingMediaUploadTicket {
  return {
    clientId,
    kind: "image",
    name,
    size: 3,
    contentType: "image/jpeg",
    lastModified: 1_786_416_000_000,
    key: `listings/listing-one/uploads/image/${clientId}-${name}`,
    uploadUrl: `https://uploads.example.invalid/${clientId}`,
    expiresAt: "2026-08-11T09:00:00.000Z",
  };
}

test("uploads file bytes directly to each presigned target with bounded concurrency", async () => {
  const calls: Array<{ url: string; method: string | undefined; contentType: string | null }> = [];
  let active = 0;
  let maxActive = 0;
  const fetchImpl = (async (input: URL | RequestInfo, init?: RequestInit) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await Promise.resolve();
    calls.push({
      url: String(input),
      method: init?.method,
      contentType: new Headers(init?.headers).get("content-type"),
    });
    active -= 1;
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  const uploads = ["front.jpg", "side.jpg", "rear.jpg"].map((name, index) => ({
    ticket: ticket(`image-${index}`, name),
    file: new File([new Uint8Array([1, 2, 3])], name, {
      type: "image/jpeg",
      lastModified: 1_786_416_000_000,
    }),
  }));

  await uploadFilesToPresignedTargets(uploads, { concurrency: 2, fetchImpl });

  assert.equal(calls.length, 3);
  assert.equal(maxActive, 2);
  assert.deepEqual(
    calls.map(({ method, contentType }) => ({ method, contentType })),
    Array.from({ length: 3 }, () => ({ method: "PUT", contentType: "image/jpeg" }))
  );
});

test("surfaces a safe filename-specific error when R2 rejects an upload", async () => {
  const rejectedTicket = ticket("image-0", "front.jpg");
  const file = new File([new Uint8Array([1, 2, 3])], "front.jpg", {
    type: "image/jpeg",
  });
  const fetchImpl = (async () => new Response(null, { status: 403 })) as typeof fetch;

  await assert.rejects(
    uploadFilesToPresignedTargets([{ ticket: rejectedTicket, file }], { fetchImpl }),
    /Unable to upload "front.jpg"/
  );
});

test("surfaces a stable-origin hint when the browser upload is blocked", async () => {
  const rejectedTicket = ticket("image-0", "front.jpg");
  const file = new File([new Uint8Array([1, 2, 3])], "front.jpg", {
    type: "image/jpeg",
  });
  const fetchImpl = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  await assert.rejects(
    uploadFilesToPresignedTargets([{ ticket: rejectedTicket, file }], { fetchImpl }),
    /stable Autolist site link/
  );
});

test("continues when finalized image rows prove a lost action response completed", async () => {
  const imageTicket = ticket("image-0", "front.jpg");
  let verifyAttempts = 0;
  const result = await finalizeListingImagesWithRecovery({
    listingId: "listing-one",
    uploads: [imageTicket],
    altTextBase: "Toyota Harrier",
    finalize: async () => {
      throw new Error("Server action transport interrupted");
    },
    verify: async () => {
      verifyAttempts += 1;
      return { success: true, uploadedCount: 1 };
    },
  });

  assert.equal(verifyAttempts, 1);
  assert.deepEqual(result, { success: true, uploadedCount: 1 });
});

test("waits for a still-running finalizer before continuing the saved draft", async () => {
  const imageTicket = ticket("image-0", "front.jpg");
  let verifyAttempts = 0;
  const delays: number[] = [];
  const result = await finalizeListingImagesWithRecovery({
    listingId: "listing-one",
    uploads: [imageTicket],
    altTextBase: "Toyota Harrier",
    finalize: async () => {
      throw new Error("Server action transport interrupted");
    },
    verify: async () => {
      verifyAttempts += 1;
      return verifyAttempts === 3
        ? { success: true, uploadedCount: 1 }
        : { error: "Listing image processing did not finish." };
    },
    verifyAttempts: 4,
    verifyDelayMs: 3_000,
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
  });

  assert.equal(verifyAttempts, 3);
  assert.deepEqual(delays, [3_000, 3_000]);
  assert.deepEqual(result, { success: true, uploadedCount: 1 });
});

test("keeps the draft recoverable when image finalization cannot be verified", async () => {
  const imageTicket = ticket("image-0", "front.jpg");
  const result = await finalizeListingImagesWithRecovery({
    listingId: "listing-one",
    uploads: [imageTicket],
    altTextBase: "Toyota Harrier",
    finalize: async () => {
      throw new Error("Server action transport interrupted");
    },
    verify: async () => ({ error: "Listing image processing did not finish." }),
    verifyAttempts: 2,
    verifyDelayMs: 0,
    sleep: async () => undefined,
  });

  assert.deepEqual(result, { error: LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR });
});
