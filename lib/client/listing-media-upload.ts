import type { ListingMediaUploadTicket } from "@/lib/listing-media-upload";

type PresignedUploadFile = {
  ticket: ListingMediaUploadTicket;
  file: File;
};

type UploadOptions = {
  concurrency?: number;
  fetchImpl?: typeof fetch;
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
      const response = await fetchImpl(ticket.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": ticket.contentType },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Unable to upload "${ticket.name}". Please try again.`);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}
