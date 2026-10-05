-- Keep scanner health settings and scan history on the account, not one browser.

alter table public.profiles
  add column if not exists health_profile jsonb;

create table if not exists public.food_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists food_scans_user_created_idx
  on public.food_scans (user_id, created_at desc);

alter table public.food_scans enable row level security;

drop policy if exists "food_scans_own_read" on public.food_scans;
create policy "food_scans_own_read" on public.food_scans
  for select using (auth.uid() = user_id);

drop policy if exists "food_scans_own_insert" on public.food_scans;
create policy "food_scans_own_insert" on public.food_scans
  for insert with check (auth.uid() = user_id);

drop policy if exists "food_scans_own_delete" on public.food_scans;
create policy "food_scans_own_delete" on public.food_scans
  for delete using (auth.uid() = user_id);
