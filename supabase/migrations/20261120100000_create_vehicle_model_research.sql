create table public.vehicle_model_research (
  research_key text primary key check (char_length(research_key) between 3 and 400),
  make text not null,
  model text not null,
  year integer not null,
  vehicle_trim text,
  variant text,
  fuel_type text,
  transmission text,
  model_summary text not null,
  buyer_fit text not null,
  known_considerations jsonb not null default '[]'::jsonb,
  researched_specs jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array' and jsonb_array_length(sources) > 0),
  research_model text,
  researched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

comment on table public.vehicle_model_research is
  'Sourced, typical model-year research reused by the vehicle comparison. Written and read by the compare API with the service role. Never merged into seller listing facts or features (ADR-0008).';
comment on column public.vehicle_model_research.research_key is
  'Normalized make|model|year|trim|variant|fuel|transmission from the seller listing identity.';
comment on column public.vehicle_model_research.sources is
  'Array of {title, url} that the research response both cited for this vehicle and returned as web-search sources.';

alter table public.vehicle_model_research enable row level security;

revoke all on table public.vehicle_model_research from anon, authenticated;
grant all on table public.vehicle_model_research to service_role;
