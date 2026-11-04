-- Keep review text out of publicly selectable approved dealership rows.
create table public.dealer_verification_workflows (
  dealer_id uuid primary key references public.dealers(id) on delete cascade,
  submitted_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamp with time zone,
  review_notes text,
  verification_notes text,
  preferred_confirmation_channel text not null default 'email'
    check (preferred_confirmation_channel = 'email')
);

alter table public.dealer_verification_workflows enable row level security;
revoke all on table public.dealer_verification_workflows from public, anon, authenticated;
grant select, insert, update, delete on table public.dealer_verification_workflows to service_role;

comment on table public.dealer_verification_workflows is
  'Private dealer verification details. Server reads require current owner or staff authorization.';

alter table public.notification_events
  drop constraint notification_events_event_type_check;
alter table public.notification_events
  add constraint notification_events_event_type_check check (event_type in (
    'new_enquiry', 'new_message', 'ticket_created', 'ticket_assigned',
    'listing_status_changed', 'listing_updated', 'appointment_requested',
    'appointment_status_changed', 'listing_alert_match', 'dealer_request_opened',
    'dealer_verification_status_changed'
  ));

notify pgrst, 'reload schema';
