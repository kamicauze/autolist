// Types for Supabase car reference tables

export type CarMake = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_popular: boolean;
  sort_order: number;
};

export type CarModel = {
  id: number;
  make_id: number;
  name: string;
  slug: string;
  is_popular: boolean;
  sort_order: number;
};

export type CarTrim = {
  id: number;
  model_id: number;
  name: string;
  is_shared: boolean;
  sort_order: number;
};

export type CarVariant = {
  id: number;
  model_id: number;
  name: string;
  sort_order: number;
};
