-- ─────────────────────────────────────────────────────────────────────────────
-- Admin RLS policies for listing moderation
-- ─────────────────────────────────────────────────────────────────────────────

-- Admin can view ALL listings (needed to see pending listings for moderation)
CREATE POLICY "Admins view all listings."
  ON public.listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update ALL listings (approve/reject status changes)
CREATE POLICY "Admins update all listings."
  ON public.listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view images for ANY listing (for reviewing listing content)
CREATE POLICY "Admins view all listing images."
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure image_hash column exists (needed by duplicate detection in upload.ts)
ALTER TABLE public.listing_images
  ADD COLUMN IF NOT EXISTS image_hash text;
