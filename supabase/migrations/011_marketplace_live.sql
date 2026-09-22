-- Live marketplace: listings bootstrap, gym memberships, influencers, menu, paid fulfillment

alter table public.gyms
  alter column address drop not null,
  alter column address set default '';

alter table public.gyms
  add column if not exists capacity int not null default 80;

alter table public.vendors
  add column if not exists published boolean not null default true;

alter table public.public_trainers
  add column if not exists published boolean not null default true,
  add column if not exists kind text not null default 'trainer'
    check (kind in ('trainer', 'nutritionist'));

alter table public.gyms
  add column if not exists published boolean not null default true;

drop policy if exists "vendors_public_read" on public.vendors;
create policy "vendors_public_read" on public.vendors
  for select using (published = true or auth.uid() = user_id);

-- Menu items per vendor
create table if not exists public.vendor_menu_items (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid references public.vendors(id) on delete cascade not null,
  name         text not null,
  description  text,
  price_naira  int not null check (price_naira >= 0),
  available    boolean not null default true,
  created_at   timestamptz default now()
);

create index if not exists vendor_menu_vendor_idx on public.vendor_menu_items (vendor_id);
alter table public.vendor_menu_items enable row level security;
drop policy if exists "menu_public_read" on public.vendor_menu_items;
create policy "menu_public_read" on public.vendor_menu_items for select using (true);
drop policy if exists "menu_owner_all" on public.vendor_menu_items;
create policy "menu_owner_all" on public.vendor_menu_items for all
  using (exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()))
  with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()));

-- Gym memberships (paid)
create table if not exists public.gym_memberships (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  gym_id             uuid references public.gyms(id) on delete cascade not null,
  plan_id            text not null,
  plan_name          text,
  amount_naira       int not null default 0,
  months             int not null default 1,
  status             text not null default 'pending'
                       check (status in ('pending','active','expired','cancelled')),
  paystack_reference text,
  starts_at          timestamptz,
  ends_at            timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists gym_memberships_gym_idx on public.gym_memberships (gym_id, status);
create index if not exists gym_memberships_user_idx on public.gym_memberships (user_id);
alter table public.gym_memberships enable row level security;
drop policy if exists "memberships_user_read" on public.gym_memberships;
create policy "memberships_user_read" on public.gym_memberships for select using (auth.uid() = user_id);
drop policy if exists "memberships_user_insert" on public.gym_memberships;
create policy "memberships_user_insert" on public.gym_memberships for insert with check (auth.uid() = user_id);
drop policy if exists "memberships_owner_read" on public.gym_memberships;
create policy "memberships_owner_read" on public.gym_memberships for select using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.user_id = auth.uid())
);
drop policy if exists "memberships_owner_update" on public.gym_memberships;
create policy "memberships_owner_update" on public.gym_memberships for update using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.user_id = auth.uid())
);

-- Influencers
create table if not exists public.influencers (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users(id) on delete cascade not null unique,
  name                     text not null,
  bio                      text,
  niche                    text,
  platform                 text default 'WeFit',
  image_url                text,
  partnership_rate_naira   int not null default 50000,
  follower_count           int not null default 0,
  view_count               int not null default 0,
  published                boolean not null default true,
  created_at               timestamptz default now()
);

alter table public.influencers enable row level security;
drop policy if exists "influencers_public_read" on public.influencers;
create policy "influencers_public_read" on public.influencers for select using (published = true or auth.uid() = user_id);
drop policy if exists "influencers_owner_all" on public.influencers;
create policy "influencers_owner_all" on public.influencers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.influencer_follows (
  influencer_id uuid references public.influencers(id) on delete cascade not null,
  follower_id   uuid references auth.users(id) on delete cascade not null,
  created_at    timestamptz default now(),
  primary key (influencer_id, follower_id)
);

alter table public.influencer_follows enable row level security;
drop policy if exists "follows_read" on public.influencer_follows;
create policy "follows_read" on public.influencer_follows for select using (true);
drop policy if exists "follows_self" on public.influencer_follows;
create policy "follows_self" on public.influencer_follows for insert with check (auth.uid() = follower_id);
drop policy if exists "follows_self_del" on public.influencer_follows;
create policy "follows_self_del" on public.influencer_follows for delete using (auth.uid() = follower_id);

create or replace function public.sync_influencer_followers()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.influencers
     set follower_count = (select count(*) from public.influencer_follows where influencer_id = coalesce(new.influencer_id, old.influencer_id))
   where id = coalesce(new.influencer_id, old.influencer_id);
  return null;
end;
$$;

drop trigger if exists trg_sync_influencer_followers on public.influencer_follows;
create trigger trg_sync_influencer_followers
after insert or delete on public.influencer_follows
for each row execute procedure public.sync_influencer_followers();

create table if not exists public.influencer_partnerships (
  id                 uuid primary key default gen_random_uuid(),
  influencer_id      uuid references public.influencers(id) on delete cascade not null,
  brand_user_id      uuid references auth.users(id) on delete cascade not null,
  amount_naira       int not null default 0,
  status             text not null default 'pending'
                       check (status in ('pending','paid','accepted','declined','cancelled')),
  notes              text,
  paystack_reference text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

alter table public.influencer_partnerships enable row level security;
drop policy if exists "partnerships_brand" on public.influencer_partnerships;
create policy "partnerships_brand" on public.influencer_partnerships for all
  using (auth.uid() = brand_user_id) with check (auth.uid() = brand_user_id);
drop policy if exists "partnerships_influencer" on public.influencer_partnerships;
create policy "partnerships_influencer" on public.influencer_partnerships for select using (
  exists (select 1 from public.influencers i where i.id = influencer_id and i.user_id = auth.uid())
);
drop policy if exists "partnerships_influencer_upd" on public.influencer_partnerships;
create policy "partnerships_influencer_upd" on public.influencer_partnerships for update using (
  exists (select 1 from public.influencers i where i.id = influencer_id and i.user_id = auth.uid())
);

-- Create a listing row when someone picks a business role
create or replace function public.ensure_business_listing(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_loc  text;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'not allowed';
  end if;
  select coalesce(nullif(name, ''), split_part(email, '@', 1), 'WeFit member'),
         coalesce(nullif(location, ''), 'Nigeria')
    into v_name, v_loc
    from public.profiles where id = p_user_id;

  if p_role = 'vendor' then
    if not exists (select 1 from public.vendors where user_id = p_user_id) then
      insert into public.vendors (user_id, name, city, address, published, delivery_fee_naira, min_order_naira)
      values (p_user_id, v_name || '''s Kitchen', v_loc, v_loc, true, 500, 1500);
    end if;

  elsif p_role = 'trainer' then
    if not exists (select 1 from public.public_trainers where user_id = p_user_id) then
      insert into public.public_trainers (user_id, name, city, price_per_session_naira, published, kind)
      values (p_user_id, v_name, v_loc, 5000, true, 'trainer');
    end if;

  elsif p_role = 'gym_owner' then
    if not exists (select 1 from public.gyms where user_id = p_user_id) then
      insert into public.gyms (user_id, name, address, city, published, capacity, membership_plans)
      values (
        p_user_id,
        v_name || ' Gym',
        v_loc,
        v_loc,
        true,
        80,
        '[{"id":"monthly","name":"Monthly","amount_naira":25000,"months":1},{"id":"quarterly","name":"Quarterly","amount_naira":65000,"months":3},{"id":"yearly","name":"Yearly","amount_naira":240000,"months":12}]'::jsonb
      );
    end if;

  elsif p_role = 'influencer' then
    insert into public.influencers (user_id, name, niche, published)
    values (p_user_id, v_name, 'Fitness', true)
    on conflict (user_id) do nothing;
  end if;
end;
$$;

-- Vendors has no unique(user_id); add one so bootstrap is idempotent
create unique index if not exists vendors_user_id_uidx on public.vendors (user_id) where user_id is not null;
create unique index if not exists trainers_user_id_uidx on public.public_trainers (user_id) where user_id is not null;
create unique index if not exists gyms_user_id_uidx on public.gyms (user_id) where user_id is not null;

-- Mark a Paystack marketplace charge as paid (service role / verify)
create or replace function public.fulfill_marketplace_payment(
  p_kind text,
  p_reference text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
begin
  if p_kind = 'meal_order' then
    update public.orders
       set status = 'confirmed', updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'meal_order');

  elsif p_kind = 'trainer_booking' then
    update public.bookings
       set status = 'confirmed', updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'trainer_booking');

  elsif p_kind = 'gym_membership' then
    update public.gym_memberships
       set status = 'active',
           starts_at = now(),
           ends_at = now() + (months || ' months')::interval,
           updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'gym_membership');

  elsif p_kind = 'partnership' then
    update public.influencer_partnerships
       set status = 'paid', updated_at = now()
     where paystack_reference = p_reference and brand_user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'partnership');
  else
    raise exception 'Unknown marketplace kind %', p_kind;
  end if;

  return v_result;
end;
$$;

grant execute on function public.ensure_business_listing(uuid, text) to authenticated;
grant execute on function public.fulfill_marketplace_payment(text, text, uuid) to service_role;

create or replace function public.increment_influencer_views(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.influencers set view_count = coalesce(view_count, 0) + 1 where id = p_id;
$$;
grant execute on function public.increment_influencer_views(uuid) to authenticated;
