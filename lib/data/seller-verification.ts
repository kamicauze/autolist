import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  SellerVerificationDocument,
  SellerVerificationRecord,
  SellerVerificationView,
} from "@/lib/types/seller-verification";

const SELLER_VERIFICATION_SELECT = `
  *,
  documents:seller_verification_documents(
    id,
    profile_id,
    document_type,
    storage_path,
    display_name,
    mime_type,
    size_bytes,
    created_at
  )
`;

const ADMIN_SELLER_VERIFICATION_SELECT = `
  *,
  profile:profiles!profile_id(id, full_name, email, phone),
  documents:seller_verification_documents(
    id,
    profile_id,
    document_type,
    storage_path,
    display_name,
    mime_type,
    size_bytes,
    created_at
  )
`;

type SchemaError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export function isSellerVerificationSchemaUnavailable(
  error: SchemaError | null | undefined,
) {
  const text = [error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    text.includes("seller_verifications") ||
    text.includes("seller_verification_documents")
  );
}

function normalizeRecord(record: SellerVerificationRecord | null) {
  if (!record) return null;
  return {
    ...record,
    documents: [...(record.documents || [])].sort((a, b) =>
      a.document_type.localeCompare(b.document_type),
    ),
  };
}

export async function getMySellerVerification(): Promise<SellerVerificationView> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { setupAvailable: true, record: null };
  }

  const { data, error } = await supabase
    .from("seller_verifications")
    .select(SELLER_VERIFICATION_SELECT)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error && isSellerVerificationSchemaUnavailable(error)) {
    return { setupAvailable: false, record: null };
  }

  if (error) {
    console.error(
      "Unable to load seller verification metadata:",
      error.code || "unknown",
    );
    return { setupAvailable: true, record: null };
  }

  return {
    setupAvailable: true,
    record: normalizeRecord(data as SellerVerificationRecord | null),
  };
}

export async function getPendingSellerVerifications(): Promise<
  SellerVerificationRecord[]
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "super_admin") return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("seller_verifications")
    .select(ADMIN_SELLER_VERIFICATION_SELECT)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if (error && isSellerVerificationSchemaUnavailable(error)) return [];
  if (error) {
    console.error(
      "Unable to load pending seller verifications:",
      error.code || "unknown",
    );
    return [];
  }

  const records = (data || []) as SellerVerificationRecord[];

  return Promise.all(
    records.map(async (record) => {
      const documents = await Promise.all(
        (record.documents || []).map(async (document) => {
          const { data: signed } = await admin.storage
            .from("seller-kyc")
            .createSignedUrl(document.storage_path, 5 * 60, { download: true });

          return {
            ...document,
            signed_url: signed?.signedUrl || null,
          } satisfies SellerVerificationDocument;
        }),
      );

      return normalizeRecord({
        ...record,
        documents,
      }) as SellerVerificationRecord;
    }),
  );
}
