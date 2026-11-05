-- Retain the selected county for custom towns without rewriting existing dealers.
ALTER TABLE public.dealers ADD COLUMN IF NOT EXISTS county text;
COMMENT ON COLUMN public.dealers.county IS 'Kenyan county selected during dealership onboarding; nullable for existing records.';
