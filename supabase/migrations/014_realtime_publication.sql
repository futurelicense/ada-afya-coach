-- Phase 13: add the marketplace tables to the realtime publication so the
-- business dashboards live-update (and toast) when orders / bookings / etc. land.

do $$
declare t text;
begin
  foreach t in array array[
    'orders', 'bookings', 'gym_memberships', 'influencer_partnerships',
    'inquiries', 'vendors', 'public_trainers', 'gyms', 'influencers',
    'influencer_follows', 'vendor_menu_items'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

alter table public.orders                  replica identity full;
alter table public.bookings                replica identity full;
alter table public.gym_memberships         replica identity full;
alter table public.influencer_partnerships replica identity full;
alter table public.inquiries               replica identity full;
