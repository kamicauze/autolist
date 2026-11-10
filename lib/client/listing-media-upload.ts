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
  onProgress?: (completed: number, total: number) => void;
  maxAttempts?: number;
  retryDelayMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
  waitForForeground?: () => Promise<void>;
  currentHost?: string;
};

const DEFAULT_UPLOAD_ATTEMPTS = 3;
const DEFAULT_UPLOAD_RETRY_DELAY_MS = 1_500;
const STABLE_VERCEL_HOSTS = new Set(["autolist-git-staging-autolist-kes-projects.vercel.app"]);

function isOneOffPreviewHost(host: string | undefined) {
  if (!host) return false;
  const normalizedHost = host.toLowerCase();
  return normalizedHost.endsWith(".vercel.app") && !STABLE_VERCEL_HOSTS.has(normalizedHost);
}

function isRetryableUploadStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

// iOS Safari suspends network requests while the tab is in the background, so
// a retry only has a chance once the seller is back on the page.
function waitForPageInForeground() {
  if (typeof document === "undefined" || document.visibilityState !== "hidden") {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") return;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resolve();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
  });
}

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
  const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? DEFAULT_UPLOAD_ATTEMPTS));
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? DEFAULT_UPLOAD_RETRY_DELAY_MS);
  const sleep = options.sleep ?? wait;
  const waitForForeground = options.waitForForeground ?? waitForPageInForeground;
  const currentHost =
    options.currentHost ?? (typeof window === "undefined" ? undefined : window.location.host);
  let nextIndex = 0;
  let completed = 0;

  const uploadOne = async ({ ticket, file }: PresignedUploadFile) => {
    for (let attempt = 1; ; attempt += 1) {
      let response: Response | null = null;
      try {
        response = await fetchImpl(ticket.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": ticket.contentType },
          body: file,
        });
      } catch {
        // The connection dropped or the browser blocked the request.
      }

      if (response?.ok) return;
      if (response && !isRetryableUploadStatus(response.status)) {
        throw new Error(`Unable to upload "${ticket.name}". Please try again.`);
      }

      if (attempt >= maxAttempts) {
        if (response) {
          throw new Error(`Unable to upload "${ticket.name}". Please try again.`);
        }
        throw new Error(
          isOneOffPreviewHost(currentHost)
            ? `Unable to upload "${ticket.name}". The upload connection was blocked or interrupted. Please open the stable Autolist site link, not a one-off preview URL, and try again.`
            : `Unable to upload "${ticket.name}". The connection dropped while uploading. Check your internet connection, keep this page open until all photos finish uploading, and try again.`
        );
      }

      await waitForForeground();
      await sleep(retryDelayMs * attempt);
    }
  };

  const worker = async () => {
    while (nextIndex < uploads.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await uploadOne(uploads[currentIndex]);

      completed += 1;
      options.onProgress?.(completed, uploads.length);
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
