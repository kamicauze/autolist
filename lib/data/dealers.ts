import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Listing } from "@/lib/types/listing";
import type {
  DealerProfile,
  DealerVerificationDocument,
  DealerVerificationRecord,
} from "@/lib/types/dealer";

const LISTING_SELECT = `
  *,
  images:listing_images(id, r2_key, alt_text, image_order),
  seller:profiles!seller_id(id, full_name, avatar_url),
  dealer:dealers(id, name, logo_url, city, mobile, whatsapp, email, address, about_text)
`;

export async function getApprovedDealers(limit = 12): Promise<DealerProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dealers:", error);
    return [];
  }

  return (data || []) as DealerProfile[];
}

export async function getDealerById(id: string): Promise<DealerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("id", id)
    .eq("status", "APPROVED")
    .single();

  if (error) {
    console.error("Error fetching dealer:", error);
    return null;
  }

  return data as DealerProfile;
}

export async function getDealerInventory(
  dealerId: string,
  limit = 8
): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("dealer_id", dealerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dealer inventory:", error);
    return [];
  }

  return (data || []) as Listing[];
}

const DEALER_VERIFICATION_SELECT = `
  *,
  profile:profiles!profile_id(id, full_name, email),
  documents:dealer_verification_documents(
    id,
    dealer_id,
    uploaded_by,
    document_type,
    display_name,
    r2_key,
    mime_type,
    size_bytes,
    created_at
  )
`;

const DEALER_VERIFICATION_LEGACY_SELECT = `
  *,
  profile:profiles!profile_id(id, full_name, email)
`;

type PostgrestSchemaError = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

function schemaErrorIncludes(error: PostgrestSchemaError | null | undefined, value: string) {
  if (!error) return false;
  return [error.message, error.details, error.hint].some((part) =>
    typeof part === "string" ? part.includes(value) : false
  );
}

function isDealerVerificationSchemaMismatch(error: PostgrestSchemaError | null | undefined) {
  return [
    "dealer_verification_documents",
    "submitted_at",
    "reviewed_by",
    "reviewed_at",
    "review_notes",
    "verification_notes",
    "preferred_confirmation_channel",
  ].some((value) => schemaErrorIncludes(error, value));
}

function buildLegacyDocuments(record: DealerProfile): DealerVerificationDocument[] {
  const contactPhotoUrl = record.contact_person?.photo_url ?? null;

  const documents: Array<DealerVerificationDocument | null> = [
    record.logo_url
      ? {
          id: `${record.id}-company-logo`,
          dealer_id: record.id,
          uploaded_by: record.profile_id,
          document_type: "company_logo" as const,
          display_name: "Company logo",
          r2_key: record.logo_url,
          mime_type: null,
          size_bytes: null,
          created_at: record.updated_at,
        }
      : null,
    contactPhotoUrl
      ? {
          id: `${record.id}-contact-photo`,
          dealer_id: record.id,
          uploaded_by: record.profile_id,
          document_type: "contact_photo" as const,
          display_name: "Contact person photo",
          r2_key: contactPhotoUrl,
          mime_type: null,
          size_bytes: null,
          created_at: record.updated_at,
        }
      : null,
    record.doc_incorporation_key
      ? {
          id: `${record.id}-incorporation-certificate`,
          dealer_id: record.id,
          uploaded_by: record.profile_id,
          document_type: "incorporation_certificate" as const,
          display_name: "Certificate of incorporation",
          r2_key: record.doc_incorporation_key,
          mime_type: null,
          size_bytes: null,
          created_at: record.updated_at,
        }
      : null,
    record.doc_id_key
      ? {
          id: `${record.id}-contact-id`,
          dealer_id: record.id,
          uploaded_by: record.profile_id,
          document_type: "contact_id" as const,
          display_name: "Contact person ID",
          r2_key: record.doc_id_key,
          mime_type: null,
          size_bytes: null,
          created_at: record.updated_at,
        }
      : null,
  ];

  return documents.filter(
    (document): document is DealerVerificationDocument => Boolean(document)
  );
}

function normalizeDealerVerificationRecord(record: DealerVerificationRecord | null) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    documents:
      record.documents && record.documents.length > 0
        ? record.documents
        : buildLegacyDocuments(record),
  };
}

export async function getMyDealerVerification(): Promise<DealerVerificationRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  let { data, error } = await supabase
    .from("dealers")
    .select(DEALER_VERIFICATION_SELECT)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error && isDealerVerificationSchemaMismatch(error)) {
    const fallback = await supabase
      .from("dealers")
      .select(DEALER_VERIFICATION_LEGACY_SELECT)
      .eq("profile_id", user.id)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error fetching dealer verification:", error);
    return null;
  }

  return normalizeDealerVerificationRecord(data as DealerVerificationRecord | null);
}

export async function getPendingDealerVerifications(): Promise<DealerVerificationRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return [];
  }

  const adminSupabase = createAdminClient();

  const query = adminSupabase
    .from("dealers")
    .select(DEALER_VERIFICATION_SELECT)
    .eq("status", "PENDING")
    .order("submitted_at", { ascending: true })
    .order("created_at", { ascending: true });

  let { data, error } = await query;

  if (error && isDealerVerificationSchemaMismatch(error)) {
    const fallback = await adminSupabase
      .from("dealers")
      .select(DEALER_VERIFICATION_LEGACY_SELECT)
      .eq("status", "PENDING")
      .order("created_at", { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error fetching pending dealer verifications:", error);
    return [];
  }

  return ((data || []) as DealerVerificationRecord[]).map((record) =>
    normalizeDealerVerificationRecord(record)
  ).filter((record): record is DealerVerificationRecord => Boolean(record));
}
