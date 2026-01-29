export type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'sold' | 'expired';

export type ListingCondition = 'new' | 'used' | 'foreign_used';

export interface ListingImage {
  id: string;
  listing_id: string;
  r2_key: string;
  alt_text: string | null;
  image_order: number;
  is_watermarked: boolean;
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
  };
}

export interface ListingFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  condition?: ListingCondition;
  city?: string;
}

export interface ListingSort {
  field: 'price' | 'year' | 'mileage' | 'created_at';
  direction: 'asc' | 'desc';
}
