-- Phase 11: role-specific features
--   - is_admin() helper + admin moderation policies
--   - business owners can read/triage inquiries that target their listing
--   - trainer weekly availability
--   - influencer posts
--   - SECURITY DEFINER roster RPCs (owner-scoped, expose member names safely)

-- ─────────────────────────────────────────────────────
-- Admin
-- ─────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_admin_read"   on public.profiles;
create policy "profiles_admin_read"   on public.profiles for select using (public.is_admin());
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries_admin_all" on public.inquiries;
create policy "inquiries_admin_all" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "challenges_admin_all" on public.community_challenges;
create policy "challenges_admin_all" on public.community_challenges for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subs_admin_read" on public.subscriptions;
create policy "subs_admin_read" on public.subscriptions for select using (public.is_admin());

drop policy if exists "vendors_admin_all"     on public.vendors;
create policy "vendors_admin_all"     on public.vendors         for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "trainers_admin_all"    on public.public_trainers;
create policy "trainers_admin_all"    on public.public_trainers for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "gyms_admin_all"        on public.gyms;
create policy "gyms_admin_all"        on public.gyms            for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "influencers_admin_all" on public.influencers;
create policy "influencers_admin_all" on public.influencers     for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_read"   on public.orders;
create policy "orders_admin_read"   on public.orders   for select using (public.is_admin());
drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read" on public.bookings for select using (public.is_admin());

-- ─────────────────────────────────────────────────────
-- Inquiry inbox for business owners
-- listing_id is text; match it to the id of a listing this user owns.
-- ─────────────────────────────────────────────────────
create or replace function public.owns_listing(p_listing_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select
       exists (select 1 from public.vendors         v where v.id::text = p_listing_id and v.user_id = auth.uid())
    or exists (select 1 from public.public_trainers t where t.id::text = p_listing_id and t.user_id = auth.uid())
    or exists (select 1 from public.gyms            g where g.id::text = p_listing_id and g.user_id = auth.uid())
    or exists (select 1 from public.influencers     i where i.id::text = p_listing_id and i.user_id = auth.uid());
$$;
grant execute on function public.owns_listing(text) to authenticated;

drop policy if exists "inquiries_listing_owner_read" on public.inquiries;
create policy "inquiries_listing_owner_read" on public.inquiries
  for select using (public.owns_listing(listing_id));
drop policy if exists "inquiries_listing_owner_update" on public.inquiries;
create policy "inquiries_listing_owner_update" on public.inquiries
  for update using (public.owns_listing(listing_id));

-- ─────────────────────────────────────────────────────
-- Trainer weekly availability (recurring slots by weekday, minutes since midnight)
-- ─────────────────────────────────────────────────────
create table if not exists public.trainer_availability (
  id          uuid primary key default gen_random_uuid(),
  trainer_id  uuid references public.public_trainers(id) on delete cascade not null,
  weekday     int not null check (weekday between 0 and 6),        -- 0 = Sunday
  start_min   int not null check (start_min between 0 and 1439),
  end_min     int not null check (end_min between 1 and 1440),
  created_at  timestamptz default now(),
  check (end_min > start_min)
);
create index if not exists trainer_avail_idx on public.trainer_availability (trainer_id, weekday);
alter table public.trainer_availability enable row level security;
drop policy if exists "avail_public_read" on public.trainer_availability;
create policy "avail_public_read" on public.trainer_availability for select using (true);
drop policy if exists "avail_owner_all" on public.trainer_availability;
create policy "avail_owner_all" on public.trainer_availability for all
  using  (exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────
-- Influencer posts
-- ─────────────────────────────────────────────────────
create table if not exists public.influencer_posts (
  id            uuid primary key default gen_random_uuid(),
  influencer_id uuid references public.influencers(id) on delete cascade not null,
  title         text,
  body          text not null,
  image_url     text,
  created_at    timestamptz default now()
);
create index if not exists influencer_posts_idx on public.influencer_posts (influencer_id, created_at desc);
alter table public.influencer_posts enable row level security;
drop policy if exists "posts_public_read" on public.influencer_posts;
create policy "posts_public_read" on public.influencer_posts for select using (true);
drop policy if exists "posts_owner_all" on public.influencer_posts;
create policy "posts_owner_all" on public.influencer_posts for all
  using  (exists (select 1 from public.influencers i where i.id = influencer_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.influencers i where i.id = influencer_id and i.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────
-- Owner-scoped roster RPCs — return member names without opening up profiles RLS
-- ─────────────────────────────────────────────────────
create or replace function public.vendor_customers(p_vendor uuid)
returns table (user_id uuid, name text, orders bigint, spent bigint, last_order timestamptz)
language sql stable security definer set search_path = public as $$
  select o.user_id,
         coalesce(p.name, 'Member'),
         count(*)                      as orders,
         coalesce(sum(o.total_naira), 0)::bigint as spent,
         max(o.created_at)             as last_order
    from public.orders o
    join public.vendors v on v.id = o.vendor_id and v.user_id = auth.uid()
    left join public.profiles p on p.id = o.user_id
   where o.vendor_id = p_vendor
     and o.status in ('confirmed','preparing','ready','delivered')
   group by o.user_id, p.name
   order by spent desc;
$$;
grant execute on function public.vendor_customers(uuid) to authenticated;

create or replace function public.trainer_clients(p_trainer uuid)
returns table (user_id uuid, name text, sessions bigint, paid bigint, last_session timestamptz)
language sql stable security definer set search_path = public as $$
  select b.user_id,
         coalesce(p.name, 'Member'),
         count(*)                       as sessions,
         coalesce(sum(b.amount_naira) filter (where b.status in ('confirmed','completed')), 0)::bigint as paid,
         max(b.scheduled_at)            as last_session
    from public.bookings b
    join public.public_trainers t on t.id = b.trainer_id and t.user_id = auth.uid()
    left join public.profiles p on p.id = b.user_id
   where b.trainer_id = p_trainer
   group by b.user_id, p.name
   order by last_session desc nulls last;
$$;
grant execute on function public.trainer_clients(uuid) to authenticated;

create or replace function public.gym_members(p_gym uuid)
returns table (id uuid, user_id uuid, name text, plan_name text, status text, amount_naira int, starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, m.user_id, coalesce(p.name, 'Member'),
         m.plan_name, m.status, m.amount_naira, m.starts_at, m.ends_at
    from public.gym_memberships m
    join public.gyms g on g.id = m.gym_id and g.user_id = auth.uid()
    left join public.profiles p on p.id = m.user_id
   where m.gym_id = p_gym
   order by m.created_at desc;
$$;
grant execute on function public.gym_members(uuid) to authenticated;

create or replace function public.influencer_followers(p_influencer uuid)
returns table (follower_id uuid, name text, since timestamptz)
language sql stable security definer set search_path = public as $$
  select f.follower_id, coalesce(p.name, 'Member'), f.created_at
    from public.influencer_follows f
    join public.influencers i on i.id = f.influencer_id and i.user_id = auth.uid()
    left join public.profiles p on p.id = f.follower_id
   where f.influencer_id = p_influencer
   order by f.created_at desc;
$$;
grant execute on function public.influencer_followers(uuid) to authenticated;

-- Gym owner can extend / comp a membership
create or replace function public.gym_extend_membership(p_membership uuid, p_months int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.gym_memberships m
     set ends_at = coalesce(greatest(m.ends_at, now()), now()) + (p_months || ' months')::interval,
         status  = 'active',
         starts_at = coalesce(m.starts_at, now()),
         updated_at = now()
   where m.id = p_membership
     and exists (select 1 from public.gyms g where g.id = m.gym_id and g.user_id = auth.uid());
end;
$$;
grant execute on function public.gym_extend_membership(uuid, int) to authenticated;

-- Admin: platform counters in one call
create or replace function public.admin_overview()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when not public.is_admin() then '{}'::jsonb else jsonb_build_object(
    'members',        (select count(*) from public.profiles),
    'pro',            (select count(*) from public.profiles where plan = 'pro'),
    'elite',          (select count(*) from public.profiles where plan = 'elite'),
    'vendors',        (select count(*) from public.vendors),
    'trainers',       (select count(*) from public.public_trainers),
    'gyms',           (select count(*) from public.gyms),
    'influencers',    (select count(*) from public.influencers),
    'open_inquiries', (select count(*) from public.inquiries where status = 'pending'),
    'gmv_naira',      (select coalesce(sum(total_naira),0) from public.orders where status in ('confirmed','preparing','ready','delivered'))
                      + (select coalesce(sum(amount_naira),0) from public.bookings where status in ('confirmed','completed'))
                      + (select coalesce(sum(amount_naira),0) from public.gym_memberships where status = 'active')
  ) end;
$$;
grant execute on function public.admin_overview() to authenticated;
