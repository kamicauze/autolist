import type {
  ListingMediaUploadReference,
  ListingMediaUploadTicket,
} from "@/lib/listing-media-upload";

type PresignedUploadFile = {
  ticket: ListingMediaUploadTicket;
  file: File;
};

type UploadOptions = {
  concurrency?: number;
  fetchImpl?: typeof fetch;
};

export const LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR =
  "Your draft and uploaded photos were saved, but we could not finish posting the listing. Try posting again; it will continue the same draft.";

type ListingImageFinalizationResult = {
  success?: boolean;
  uploadedCount?: number;
  error?: string;
};

type FinalizeListingImagesInput = {
  listingId: string;
  uploads: ListingMediaUploadReference[];
  altTextBase: string;
  finalize: (
    listingId: string,
    uploads: ListingMediaUploadReference[],
    altTextBase: string
  ) => Promise<ListingImageFinalizationResult>;
  verify: (
    listingId: string,
    uploads: ListingMediaUploadReference[]
  ) => Promise<ListingImageFinalizationResult>;
  verifyAttempts?: number;
  verifyDelayMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
};

const DEFAULT_FINALIZATION_VERIFY_ATTEMPTS = 16;
const DEFAULT_FINALIZATION_VERIFY_DELAY_MS = 3_000;

function wait(delayMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

export async function uploadFilesToPresignedTargets(
  uploads: PresignedUploadFile[],
  options: UploadOptions = {}
) {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, uploads.length || 1));
  const fetchImpl = options.fetchImpl ?? fetch;
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < uploads.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const { ticket, file } = uploads[currentIndex];
      let response: Response;
      try {
        response = await fetchImpl(ticket.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": ticket.contentType },
          body: file,
        });
      } catch {
        throw new Error(
          `Unable to upload "${ticket.name}". The upload connection was blocked or interrupted. Please open the stable Autolist site link, not a one-off preview URL, and try again.`
        );
      }

      if (!response.ok) {
        throw new Error(`Unable to upload "${ticket.name}". Please try again.`);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

export async function finalizeListingImagesWithRecovery({
  listingId,
  uploads,
  altTextBase,
  finalize,
  verify,
  verifyAttempts = DEFAULT_FINALIZATION_VERIFY_ATTEMPTS,
  verifyDelayMs = DEFAULT_FINALIZATION_VERIFY_DELAY_MS,
  sleep = wait,
}: FinalizeListingImagesInput): Promise<ListingImageFinalizationResult> {
  try {
    return await finalize(listingId, uploads, altTextBase);
  } catch {
    const attempts = Math.max(1, Math.floor(verifyAttempts));

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const verified = await verify(listingId, uploads);
        if (verified.success) return verified;
      } catch {
        // The finalizer may still be completing after its response was lost.
      }

      if (attempt < attempts - 1) {
        await sleep(Math.max(0, verifyDelayMs));
      }
    }

    return { error: LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR };
  }
}
