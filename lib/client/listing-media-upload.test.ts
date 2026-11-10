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
  const progress: Array<[number, number]> = [];
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

  await uploadFilesToPresignedTargets(uploads, {
    concurrency: 2,
    fetchImpl,
    onProgress: (completed, total) => progress.push([completed, total]),
  });

  assert.equal(calls.length, 3);
  assert.equal(maxActive, 2);
  assert.deepEqual(progress, [[1, 3], [2, 3], [3, 3]]);
  assert.deepEqual(
    calls.map(({ method, contentType }) => ({ method, contentType })),
    Array.from({ length: 3 }, () => ({ method: "PUT", contentType: "image/jpeg" }))
  );
});

const noWait = {
  sleep: async () => {},
  waitForForeground: async () => {},
};

function jpeg(name: string) {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });
}

test("surfaces a safe filename-specific error when R2 rejects an upload without retrying", async () => {
  const rejectedTicket = ticket("image-0", "front.jpg");
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return new Response(null, { status: 403 });
  }) as typeof fetch;

  await assert.rejects(
    uploadFilesToPresignedTargets([{ ticket: rejectedTicket, file: jpeg("front.jpg") }], {
      fetchImpl,
      ...noWait,
    }),
    /Unable to upload "front.jpg"/
  );
  assert.equal(calls, 1);
});

test("retries a dropped upload connection and continues once it succeeds", async () => {
  const uploads = ["front.jpg", "side.jpg"].map((name, index) => ({
    ticket: ticket(`image-${index}`, name),
    file: jpeg(name),
  }));
  const callsByUrl = new Map<string, number>();
  const delays: number[] = [];
  let foregroundWaits = 0;
  const fetchImpl = (async (input: URL | RequestInfo) => {
    const url = String(input);
    const count = (callsByUrl.get(url) ?? 0) + 1;
    callsByUrl.set(url, count);
    if (url.endsWith("image-0") && count === 1) throw new TypeError("Load failed");
    if (url.endsWith("image-1") && count === 1) return new Response(null, { status: 503 });
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  const progress: Array<[number, number]> = [];

  await uploadFilesToPresignedTargets(uploads, {
    concurrency: 1,
    fetchImpl,
    retryDelayMs: 100,
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
    waitForForeground: async () => {
      foregroundWaits += 1;
    },
    onProgress: (completed, total) => progress.push([completed, total]),
  });

  assert.deepEqual(Object.fromEntries(callsByUrl), {
    "https://uploads.example.invalid/image-0": 2,
    "https://uploads.example.invalid/image-1": 2,
  });
  assert.deepEqual(delays, [100, 100]);
  assert.equal(foregroundWaits, 2);
  assert.deepEqual(progress, [[1, 2], [2, 2]]);
});

test("asks the seller to keep the page open when the connection keeps dropping on the stable site", async () => {
  const rejectedTicket = ticket("image-0", "front.jpg");
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    throw new TypeError("Load failed");
  }) as typeof fetch;

  await assert.rejects(
    uploadFilesToPresignedTargets([{ ticket: rejectedTicket, file: jpeg("front.jpg") }], {
      fetchImpl,
      currentHost: "autolist.co.ke",
      ...noWait,
    }),
    (error: Error) => {
      assert.match(error.message, /Unable to upload "front.jpg"\. The connection dropped/);
      assert.match(error.message, /keep this page open/);
      assert.doesNotMatch(error.message, /preview URL/);
      return true;
    }
  );
  assert.equal(calls, 3);
});

test("surfaces a stable-origin hint when the upload is blocked on a one-off preview URL", async () => {
  const rejectedTicket = ticket("image-0", "front.jpg");
  const fetchImpl = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  await assert.rejects(
    uploadFilesToPresignedTargets([{ ticket: rejectedTicket, file: jpeg("front.jpg") }], {
      fetchImpl,
      currentHost: "autolist-abc123-autolist-kes-projects.vercel.app",
      ...noWait,
    }),
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
