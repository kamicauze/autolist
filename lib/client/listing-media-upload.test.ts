import assert from "node:assert/strict";
import test from "node:test";
import type { ListingMediaUploadTicket } from "@/lib/listing-media-upload";
import { uploadFilesToPresignedTargets } from "./listing-media-upload";

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
