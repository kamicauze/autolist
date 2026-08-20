export type SellerVerificationStatus =
  "draft" | "pending" | "approved" | "rejected";

export type SellerVerificationDocumentType =
  "national_id_front" | "national_id_back";

export type SellerVerificationDocument = {
  id: string;
  profile_id: string;
  document_type: SellerVerificationDocumentType;
  storage_path: string;
  display_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  signed_url?: string | null;
};

export type SellerVerificationRecord = {
  profile_id: string;
  status: SellerVerificationStatus;
  phone: string | null;
  phone_verified_at: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  documents: SellerVerificationDocument[];
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type SellerVerificationView = {
  setupAvailable: boolean;
  record: SellerVerificationRecord | null;
};
