export type SellerProfileRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "sales_agent"
  | "support"
  | "admin"
  | "super_admin";

export interface SellerProfileRecord {
  full_name: string | null;
  avatar_url: string | null;
  role: SellerProfileRole | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
}
