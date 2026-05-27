import type { ListingCategory, ListingStatus } from "@/lib/constants/marketplace";

export type { ListingStatus };

export type ListingCondition = 'new' | 'locally_used' | 'foreign_used' | 'used';

export interface ListingImage {
  id: string;
  listing_id: string;
  r2_key: string;
  alt_text: string | null;
  image_order: number;
  is_watermarked: boolean;
  image_hash?: string | null;
  perceptual_hash?: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  dealer_id: string | null;
  status: ListingStatus;

  // Vehicle Data
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
  condition: ListingCondition | null;
  seats: number | null;
  doors: number | null;
  drive_type: string | null;
  is_featured: boolean;

  description: string | null;
  features: string[] | null;
  metadata: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;

  // Joined data
  images?: ListingImage[];
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  dealer?: {
    id: string;
    name: string;
    logo_url: string | null;
    city: string | null;
    mobile?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    about_text?: string;
    social_links?: Record<string, unknown> | null;
  };
}

export interface ListingFilters {
  q?: string;
  category?: ListingCategory;
  make?: string | string[];
  model?: string | string[];
  origin?: string;
  equipmentType?: string | string[];
  useCase?: string;
  intent?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string | string[];
  transmission?: string | string[];
  fuelType?: string | string[];
  condition?: ListingCondition;
  city?: string;
  location?: string | string[];
  color?: string;
  seats?: number;
  doors?: number;
  driveType?: string | string[];
  sellerType?: 'dealer' | 'private';
  verifiedOnly?: boolean;
  minMileage?: number;
  maxMileage?: number;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_low'
  | 'price_high'
  | 'year_new'
  | 'year_old'
  | 'mileage_low'
  | 'mileage_high';

export interface ListingSort {
  field: 'price' | 'year' | 'mileage' | 'created_at';
  direction: 'asc' | 'desc';
}
