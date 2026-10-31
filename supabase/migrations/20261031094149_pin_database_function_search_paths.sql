-- These existing bodies qualify application tables/helpers with public and use
-- pg_catalog built-ins. An empty path prevents caller-controlled name resolution.
-- Preserve function bodies, ownership, EXECUTE grants and RLS helper behavior.
alter function public.handle_new_user() set search_path = '';
alter function public.has_permission(uuid, text) set search_path = '';
alter function public.is_staff(uuid) set search_path = '';
alter function public.is_super_admin(uuid) set search_path = '';
alter function public.set_cms_banners_updated_at() set search_path = '';
alter function public.set_cms_blocks_updated_at() set search_path = '';
alter function public.set_cms_media_assets_updated_at() set search_path = '';
alter function public.set_cms_special_offers_updated_at() set search_path = '';
alter function public.set_content_page_updated_at() set search_path = '';
alter function public.set_content_posts_updated_at() set search_path = '';
alter function public.set_featured_listing_pins_updated_at() set search_path = '';
alter function public.set_insurance_request_updated_at() set search_path = '';
alter function public.set_platform_settings_updated_at() set search_path = '';
alter function public.set_seller_package_entitlement_updated_at() set search_path = '';
alter function public.sync_listing_offer_settings_columns() set search_path = '';
alter function public.sync_thread_after_message() set search_path = '';
alter function public.touch_appointment_request_response() set search_path = '';
alter function public.touch_updated_at() set search_path = '';
