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
};

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
}: FinalizeListingImagesInput): Promise<ListingImageFinalizationResult> {
  try {
    return await finalize(listingId, uploads, altTextBase);
  } catch {
    try {
      const verified = await verify(listingId, uploads);
      return verified.success
        ? verified
        : { error: LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR };
    } catch {
      return { error: LISTING_IMAGE_FINALIZATION_RECOVERY_ERROR };
    }
  }
}
