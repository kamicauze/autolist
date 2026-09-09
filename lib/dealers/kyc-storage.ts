import { createAdminClient } from "@/lib/supabase/admin";

export const DEALER_KYC_BUCKET = "dealer-kyc";
export const DEALER_KYC_REFERENCE_PREFIX = `supabase://${DEALER_KYC_BUCKET}/`;

export function createDealerKycReference(storagePath: string) {
  return `${DEALER_KYC_REFERENCE_PREFIX}${storagePath}`;
}

export function getDealerKycStoragePath(reference: string) {
  if (!reference.startsWith(DEALER_KYC_REFERENCE_PREFIX)) return null;
  const storagePath = reference.slice(DEALER_KYC_REFERENCE_PREFIX.length);
  return storagePath || null;
}

export async function createDealerKycReviewUrl(
  reference: string,
  expiresInSeconds = 300,
) {
  const storagePath = getDealerKycStoragePath(reference);
  if (!storagePath) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(DEALER_KYC_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    console.error("Unable to sign dealer KYC document:", error.message);
    return null;
  }

  return data.signedUrl;
}
