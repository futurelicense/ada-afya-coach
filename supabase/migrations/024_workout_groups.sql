-- Friend groups: invites, an agreed workout schedule, a locked vendor meal plan,
-- realtime chat, shared progress, and a pitch for a trainer's monthly package.

create table public.workout_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workout_group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.workout_groups(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  email      text,
  status     text not null default 'invited' check (status in ('invited', 'joined')),
  created_at timestamptz not null default now(),
  unique (group_id, user_id),
  unique (group_id, email)
);

create table public.group_schedule_slots (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.workout_groups(id) on delete cascade,
  weekday    int not null check (weekday between 0 and 6),
  start_time text not null,
  label      text not null default 'Workout',
  created_by uuid not null references auth.users(id) on delete cascade
);

create table public.group_schedule_agreements (
  slot_id uuid not null references public.group_schedule_slots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (slot_id, user_id)
);

create table public.group_meal_locks (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.workout_groups(id) on delete cascade,
  meal_plan_id uuid not null references public.vendor_meal_plans(id) on delete cascade,
  status       text not null default 'proposed' check (status in ('proposed', 'locked')),
  proposed_by  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table public.group_meal_agreements (
  lock_id uuid not null references public.group_meal_locks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (lock_id, user_id)
);

create table public.group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.workout_groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index group_messages_group_idx on public.group_messages (group_id, created_at);

create table public.trainer_packages (
  id                  uuid primary key default gen_random_uuid(),
  trainer_id          uuid not null references public.public_trainers(id) on delete cascade,
  title               text not null,
  months              int not null check (months between 1 and 12),
  sessions_per_month  int not null check (sessions_per_month between 1 and 20),
  price_naira         int not null check (price_naira >= 0),
  summary             text not null default '',
  published           boolean not null default true,
  created_at          timestamptz not null default now()
);

create table public.group_trainer_pitches (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.workout_groups(id) on delete cascade,
  package_id  uuid not null references public.trainer_packages(id) on delete cascade,
  status      text not null default 'pitched' check (status in ('pitched', 'booked')),
  pitched_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (group_id, package_id)
);

create or replace function public.can_see_group(p_group uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.workout_group_members m
    left join public.profiles p on p.id = auth.uid()
    where m.group_id = p_group
      and (
        m.user_id = auth.uid()
        or (m.email is not null and p.email is not null and lower(m.email) = lower(p.email))
      )
  );
$$;

create or replace function public.is_joined_member(p_group uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workout_group_members
    where group_id = p_group and user_id = auth.uid() and status = 'joined'
  );
$$;

create or replace function public.group_progress(p_group uuid)
returns table (user_id uuid, name text, sessions bigint)
language sql stable security definer set search_path = public as $$
  select m.user_id,
         coalesce(p.name, 'Member'),
         (
           select count(*)
           from public.workout_sessions w
           where w.user_id = m.user_id
             and w.completed = true
             and w.date >= (current_date - 6)
         )
  from public.workout_group_members m
  left join public.profiles p on p.id = m.user_id
  where m.group_id = p_group
    and m.status = 'joined'
    and public.can_see_group(p_group);
$$;

create or replace function public.agree_group_meal(p_lock uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
  joined_count int;
  agreed_count int;
begin
  select group_id into gid from public.group_meal_locks where id = p_lock;
  if gid is null or not public.is_joined_member(gid) then
    raise exception 'Join the group before agreeing to a meal plan';
  end if;
  insert into public.group_meal_agreements (lock_id, user_id)
  values (p_lock, auth.uid())
  on conflict do nothing;
  select count(*) into joined_count
  from public.workout_group_members
  where group_id = gid and status = 'joined';
  select count(*) into agreed_count
  from public.group_meal_agreements a
  join public.workout_group_members m
    on m.user_id = a.user_id and m.group_id = gid and m.status = 'joined'
  where a.lock_id = p_lock;
  if joined_count > 0 and agreed_count >= joined_count then
    update public.group_meal_locks set status = 'locked' where id = p_lock;
    return 'locked';
  end if;
  return 'proposed';
end $$;

grant execute on function public.can_see_group(uuid) to authenticated;
grant execute on function public.is_joined_member(uuid) to authenticated;
grant execute on function public.group_progress(uuid) to authenticated;
grant execute on function public.agree_group_meal(uuid) to authenticated;

alter table public.workout_groups enable row level security;
alter table public.workout_group_members enable row level security;
alter table public.group_schedule_slots enable row level security;
alter table public.group_schedule_agreements enable row level security;
alter table public.group_meal_locks enable row level security;
alter table public.group_meal_agreements enable row level security;
alter table public.group_messages enable row level security;
alter table public.trainer_packages enable row level security;
alter table public.group_trainer_pitches enable row level security;

create policy "own groups" on public.workout_groups
  for select using (public.can_see_group(id) or owner_id = auth.uid());
create policy "create groups" on public.workout_groups
  for insert with check (owner_id = auth.uid());

create policy "see group members" on public.workout_group_members
  for select using (public.can_see_group(group_id) or user_id = auth.uid());
create policy "add group members" on public.workout_group_members
  for insert with check (
    exists (select 1 from public.workout_groups g where g.id = group_id and g.owner_id = auth.uid())
    or public.is_joined_member(group_id)
  );
create policy "accept group invite" on public.workout_group_members
  for update using (
    status = 'invited'
    and lower(email) = lower((select email from public.profiles where id = auth.uid()))
  ) with check (user_id = auth.uid() and status = 'joined');

create policy "see schedule" on public.group_schedule_slots
  for select using (public.can_see_group(group_id));
create policy "propose schedule" on public.group_schedule_slots
  for insert with check (public.is_joined_member(group_id) and created_by = auth.uid());

create policy "see schedule agreements" on public.group_schedule_agreements
  for select using (
    exists (
      select 1 from public.group_schedule_slots s
      where s.id = slot_id and public.can_see_group(s.group_id)
    )
  );
create policy "agree schedule" on public.group_schedule_agreements
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.group_schedule_slots s
      where s.id = slot_id and public.is_joined_member(s.group_id)
    )
  );

create policy "see meal locks" on public.group_meal_locks
  for select using (
    public.can_see_group(group_id)
    or exists (
      select 1 from public.vendor_meal_plans p
      join public.vendors v on v.id = p.vendor_id
      where p.id = meal_plan_id and v.user_id = auth.uid() and status = 'locked'
    )
  );
create policy "propose meal lock" on public.group_meal_locks
  for insert with check (public.is_joined_member(group_id) and proposed_by = auth.uid() and status = 'proposed');

create policy "see meal agreements" on public.group_meal_agreements
  for select using (
    exists (
      select 1 from public.group_meal_locks l
      where l.id = lock_id and public.can_see_group(l.group_id)
    )
  );

create policy "see group chat" on public.group_messages
  for select using (public.can_see_group(group_id));
create policy "send group chat" on public.group_messages
  for insert with check (public.is_joined_member(group_id) and user_id = auth.uid());

create policy "read trainer packages" on public.trainer_packages
  for select using (
    published = true
    or exists (
      select 1 from public.public_trainers t
      where t.id = trainer_id and t.user_id = auth.uid()
    )
  );
create policy "trainer writes packages" on public.trainer_packages
  for all using (
    exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.public_trainers t where t.id = trainer_id and t.user_id = auth.uid())
  );

create policy "see trainer pitches" on public.group_trainer_pitches
  for select using (
    public.can_see_group(group_id)
    or exists (
      select 1 from public.trainer_packages k
      join public.public_trainers t on t.id = k.trainer_id
      where k.id = package_id and t.user_id = auth.uid()
    )
  );
create policy "pitch trainer package" on public.group_trainer_pitches
  for insert with check (public.is_joined_member(group_id) and pitched_by = auth.uid() and status = 'pitched');
create policy "trainer books pitched package" on public.group_trainer_pitches
  for update using (
    exists (
      select 1 from public.trainer_packages k
      join public.public_trainers t on t.id = k.trainer_id
      where k.id = package_id and t.user_id = auth.uid()
    )
  ) with check (status in ('pitched', 'booked'));

do $$
declare t text;
begin
  foreach t in array array['group_messages'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

alter table public.group_messages replica identity full;
