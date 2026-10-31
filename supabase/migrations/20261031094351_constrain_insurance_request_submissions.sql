-- Guests can request a quote; ownership and staff-managed quote fields are not
-- caller-controlled. The application submits new KES requests with these defaults.
alter policy "Anyone can submit insurance requests."
  on public.insurance_requests
  with check (
    (requester_profile_id is null or requester_profile_id = (select auth.uid()))
    and status = 'new'
    and quote_currency = 'KES'
    and insurer_name is null
    and quote_amount is null
    and admin_notes is null
    and quoted_at is null
    and bound_at is null
  );
