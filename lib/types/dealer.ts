export interface DealerContactPerson {
  name?: string;
  role?: string;
  mobile?: string;
}

export interface DealerSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
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
  created_at: string;
  updated_at: string;
}
