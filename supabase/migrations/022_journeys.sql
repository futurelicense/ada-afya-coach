-- One active fitness journey per member, with dated pose check-ins.
-- Photos stay in progress_photos and point at the check-in they belong to.

create table public.journeys (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  focus          text not null check (focus in ('reduce-belly-fat', 'build-legs')),
  status         text not null default 'active' check (status in ('active', 'completed')),
  fitness_level  text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  equipment      text not null check (equipment in ('home', 'gym', 'both')),
  weight_kg      numeric(5,1),
  height_cm      numeric(5,1),
  waist_cm       numeric(5,1),
  started_on     date not null default current_date,
  target_on      date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index journeys_one_active_per_user
  on public.journeys (user_id)
  where status = 'active';

create index journeys_user_idx on public.journeys (user_id, started_on desc);

create table public.journey_checkins (
  id          uuid primary key default gen_random_uuid(),
  journey_id  uuid not null references public.journeys(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('baseline', 'checkin')),
  weight_kg   numeric(5,1),
  waist_cm    numeric(5,1),
  taken_on    date not null default current_date,
  created_at  timestamptz not null default now()
);

create index journey_checkins_journey_idx
  on public.journey_checkins (journey_id, taken_on desc);

alter table public.progress_photos
  add column if not exists journey_id uuid references public.journeys(id) on delete cascade,
  add column if not exists checkin_id uuid references public.journey_checkins(id) on delete cascade;

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'progress_photos'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%angle%'
  loop
    execute format('alter table public.progress_photos drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.progress_photos
  add constraint progress_photos_angle_check
  check (angle is null or angle in ('front', 'side', 'back', 'legs_front', 'legs_side'));

alter table public.journeys enable row level security;
alter table public.journey_checkins enable row level security;

create policy "own journeys" on public.journeys
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own journey checkins" on public.journey_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
