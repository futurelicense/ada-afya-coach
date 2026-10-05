-- Trainer routines and vendor meal plans a member can request for one journey.
-- Nutritionists stay a listing type on public_trainers.kind, not a new role.

create table public.trainer_routines (
  id           uuid primary key default gen_random_uuid(),
  trainer_id   uuid not null references public.public_trainers(id) on delete cascade,
  focus        text not null check (focus in ('reduce-belly-fat', 'build-legs')),
  title        text not null,
  summary      text not null default '',
  price_naira  int not null default 0 check (price_naira >= 0),
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index trainer_routines_focus_idx on public.trainer_routines (focus, published);

create table public.trainer_routine_moves (
  id          uuid primary key default gen_random_uuid(),
  routine_id  uuid not null references public.trainer_routines(id) on delete cascade,
  sort        int not null default 0,
  name        text not null,
  sets        int not null default 3 check (sets > 0),
  reps        int not null default 10 check (reps > 0),
  cue         text not null default '',
  audio_path  text,
  clip_path   text
);

create index trainer_routine_moves_sort_idx on public.trainer_routine_moves (routine_id, sort);

create table public.vendor_meal_plans (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid not null references public.vendors(id) on delete cascade,
  focus        text not null check (focus in ('reduce-belly-fat', 'build-legs')),
  title        text not null,
  summary      text not null default '',
  price_naira  int not null default 0 check (price_naira >= 0),
  meals        jsonb not null default '[]',
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index vendor_meal_plans_focus_idx on public.vendor_meal_plans (focus, published);

create table public.journey_requests (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid not null references public.journeys(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('routine', 'meal_plan')),
  routine_id    uuid references public.trainer_routines(id) on delete cascade,
  meal_plan_id  uuid references public.vendor_meal_plans(id) on delete cascade,
  status        text not null default 'requested' check (status in ('requested', 'accepted')),
  created_at    timestamptz not null default now(),
  check (
    (kind = 'routine' and routine_id is not null and meal_plan_id is null)
    or (kind = 'meal_plan' and meal_plan_id is not null and routine_id is null)
  )
);

create unique index journey_requests_one_routine
  on public.journey_requests (journey_id, routine_id) where routine_id is not null;
create unique index journey_requests_one_meal_plan
  on public.journey_requests (journey_id, meal_plan_id) where meal_plan_id is not null;

alter table public.trainer_routines enable row level security;
alter table public.trainer_routine_moves enable row level security;
alter table public.vendor_meal_plans enable row level security;
alter table public.journey_requests enable row level security;

create policy "read published routines" on public.trainer_routines
  for select using (
    published = true
    or exists (
      select 1 from public.public_trainers t
      where t.id = trainer_id and t.user_id = auth.uid()
    )
  );

create policy "trainer writes routines" on public.trainer_routines
  for all using (
    exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid())
  );

create policy "read routine moves" on public.trainer_routine_moves
  for select using (
    exists (
      select 1 from public.trainer_routines r
      left join public.public_trainers t on t.id = r.trainer_id
      where r.id = routine_id and (r.published = true or t.user_id = auth.uid())
    )
  );

create policy "trainer writes routine moves" on public.trainer_routine_moves
  for all using (
    exists (
      select 1 from public.trainer_routines r
      join public.public_trainers t on t.id = r.trainer_id
      where r.id = routine_id and t.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.trainer_routines r
      join public.public_trainers t on t.id = r.trainer_id
      where r.id = routine_id and t.user_id = auth.uid()
    )
  );

create policy "read published meal plans" on public.vendor_meal_plans
  for select using (
    published = true
    or exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "vendor writes meal plans" on public.vendor_meal_plans
  for all using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

create policy "member reads own journey requests" on public.journey_requests
  for select using (auth.uid() = user_id);

create policy "member requests for active journey" on public.journey_requests
  for insert with check (
    auth.uid() = user_id
    and status = 'requested'
    and exists (
      select 1 from public.journeys j
      where j.id = journey_id and j.user_id = auth.uid() and j.status = 'active'
    )
  );

create policy "trainer reads routine requests" on public.journey_requests
  for select using (
    exists (
      select 1 from public.trainer_routines r
      join public.public_trainers t on t.id = r.trainer_id
      where r.id = routine_id and t.user_id = auth.uid()
    )
  );

create policy "vendor reads meal plan requests" on public.journey_requests
  for select using (
    exists (
      select 1 from public.vendor_meal_plans p
      join public.vendors v on v.id = p.vendor_id
      where p.id = meal_plan_id and v.user_id = auth.uid()
    )
  );

create policy "trainer accepts routine requests" on public.journey_requests
  for update using (
    exists (
      select 1 from public.trainer_routines r
      join public.public_trainers t on t.id = r.trainer_id
      where r.id = routine_id and t.user_id = auth.uid()
    )
  ) with check (status in ('requested', 'accepted'));

create policy "vendor accepts meal plan requests" on public.journey_requests
  for update using (
    exists (
      select 1 from public.vendor_meal_plans p
      join public.vendors v on v.id = p.vendor_id
      where p.id = meal_plan_id and v.user_id = auth.uid()
    )
  ) with check (status in ('requested', 'accepted'));

insert into storage.buckets (id, name, public)
values ('routine-media', 'routine-media', true)
on conflict (id) do nothing;

drop policy if exists "routine media public read" on storage.objects;
create policy "routine media public read" on storage.objects
  for select using (bucket_id = 'routine-media');

drop policy if exists "routine media owner write" on storage.objects;
create policy "routine media owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'routine-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
