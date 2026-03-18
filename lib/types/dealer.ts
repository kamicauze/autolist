export interface DealerContactPerson {
  name?: string;
  role?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  photo_url?: string | null;
}

export interface DealerSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  tiktok?: string;
  other?: string;
  [key: string]: string | undefined;
}

export interface DealerProfile {
  id: string;
  profile_id: string;
  name: string;
  business_name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  address: string | null;
  city: string | null;
  location: string | null;
  mobile: string;
  email: string;
  whatsapp: string;
  website: string | null;
  logo_url: string | null;
  about_text: string | null;
  social_links: DealerSocialLinks | null;
  contact_person: DealerContactPerson | null;
  doc_incorporation_key?: string | null;
  doc_id_key?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
  verification_notes?: string | null;
  preferred_confirmation_channel?: "email" | "whatsapp" | "sms" | null;
  review_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealerVerificationDocument {
  id: string;
  dealer_id: string;
  uploaded_by: string;
  document_type:
    | "company_logo"
    | "contact_photo"
    | "incorporation_certificate"
    | "contact_id";
  display_name: string;
  r2_key: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface DealerVerificationRecord extends DealerProfile {
  documents: DealerVerificationDocument[];
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}
