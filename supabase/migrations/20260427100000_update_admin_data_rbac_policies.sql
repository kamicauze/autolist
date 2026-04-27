insert into public.permissions (key, label, description, category)
values
  ('admin.manage_payments', 'Manage payments', 'View payment operations, summaries, and transaction records.', 'Payments'),
  ('admin.manage_insurance', 'Manage insurance requests', 'View and update insurance request workflows.', 'Insurance')
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category;

insert into public.role_permissions (role, permission_key)
values
  ('super_admin', 'admin.manage_payments'),
  ('super_admin', 'admin.manage_insurance'),
  ('admin', 'admin.manage_payments'),
  ('admin', 'admin.manage_insurance')
on conflict do nothing;

drop policy if exists "Admins view all dealer profiles." on public.dealers;
create policy "Admins view all dealer profiles."
  on public.dealers
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_dealers'));

drop policy if exists "Admins update dealer profiles." on public.dealers;
create policy "Admins update dealer profiles."
  on public.dealers
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_dealers'))
  with check (public.has_permission(auth.uid(), 'admin.manage_dealers'));

drop policy if exists "Admins view all dealer verification documents." on public.dealer_verification_documents;
create policy "Admins view all dealer verification documents."
  on public.dealer_verification_documents
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_dealers'));

drop policy if exists "Admins view audit logs." on public.audit_logs;
create policy "Admins view audit logs."
  on public.audit_logs
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_settings'));

drop policy if exists "Admins view all payments." on public.payments;
create policy "Admins view all payments."
  on public.payments
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_payments'));

drop policy if exists "Admins view all insurance requests." on public.insurance_requests;
create policy "Admins view all insurance requests."
  on public.insurance_requests
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_insurance'));

drop policy if exists "Admins update insurance requests." on public.insurance_requests;
create policy "Admins update insurance requests."
  on public.insurance_requests
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_insurance'))
  with check (public.has_permission(auth.uid(), 'admin.manage_insurance'));

drop policy if exists "Admins view all content posts." on public.content_posts;
create policy "Admins view all content posts."
  on public.content_posts
  for select
  using (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins insert content posts." on public.content_posts;
create policy "Admins insert content posts."
  on public.content_posts
  for insert
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));

drop policy if exists "Admins update content posts." on public.content_posts;
create policy "Admins update content posts."
  on public.content_posts
  for update
  using (public.has_permission(auth.uid(), 'admin.manage_cms'))
  with check (public.has_permission(auth.uid(), 'admin.manage_cms'));
