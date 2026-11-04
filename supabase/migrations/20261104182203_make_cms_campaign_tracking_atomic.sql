-- Called only by the server tracking route; one UPDATE retains concurrent events.
create or replace function public.record_cms_campaign_event(
  event_type text,
  campaign_ids uuid[]
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected integer;
begin
  if campaign_ids is null or cardinality(campaign_ids) not between 1 and 12 then
    raise exception 'Provide between 1 and 12 campaign IDs.' using errcode = '22023';
  end if;

  if event_type in ('banner_impression', 'banner_click') then
    update public.cms_banners
    set impression_count = impression_count + case when event_type = 'banner_impression' then 1 else 0 end,
        click_count = click_count + case when event_type = 'banner_click' then 1 else 0 end
    where id = any(campaign_ids)
      and status = 'active'
      and desktop_image_url <> ''
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now());
  elsif event_type = 'offer_redemption' then
    update public.cms_special_offers
    set redemption_count = redemption_count + 1
    where id = any(campaign_ids)
      and status = 'active'
      and image_url <> ''
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now());
  else
    raise exception 'Unknown campaign event.' using errcode = '22023';
  end if;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke execute on function public.record_cms_campaign_event(text, uuid[]) from public, anon, authenticated;
grant execute on function public.record_cms_campaign_event(text, uuid[]) to service_role;
