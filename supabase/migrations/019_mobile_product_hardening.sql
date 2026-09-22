-- Mobile product hardening
--   * restore safe, role-owned marketplace status transitions after migration 017
--   * make paid references unique and replay-safe
--   * authorize live viewers with presence-backed counts
--   * keep daily stats, automatic goals and community meal activity server-owned

-- ── AI usage invariants ─────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ai_usage'::regclass
      and conname = 'ai_usage_count_nonnegative'
  ) then
    alter table public.ai_usage
      add constraint ai_usage_count_nonnegative check (count >= 0);
  end if;
end;
$$;

-- ── Paid marketplace records ────────────────────────────────
-- A Paystack reference represents one charge and must never fulfill two rows.
create unique index if not exists orders_paystack_reference_uidx
  on public.orders (paystack_reference)
  where paystack_reference is not null and paystack_reference <> '';

create unique index if not exists bookings_paystack_reference_uidx
  on public.bookings (paystack_reference)
  where paystack_reference is not null and paystack_reference <> '';

create unique index if not exists memberships_paystack_reference_uidx
  on public.gym_memberships (paystack_reference)
  where paystack_reference is not null and paystack_reference <> '';

create unique index if not exists partnerships_paystack_reference_uidx
  on public.influencer_partnerships (paystack_reference)
  where paystack_reference is not null and paystack_reference <> '';

-- Clients cannot alter prices, owners, payment references, or arbitrary states.
-- This RPC exposes only the small state machine each record owner needs.
create or replace function public.transition_marketplace_record(
  p_kind text,
  p_record_id uuid,
  p_new_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_current text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_kind = 'order' then
    select o.status into v_current
      from public.orders o
      join public.vendors v on v.id = o.vendor_id
     where o.id = p_record_id and v.user_id = v_user_id
     for update of o;

    if not found then
      raise exception 'Order not found or not owned by this vendor' using errcode = '42501';
    end if;
    if not (
      (v_current = 'confirmed' and p_new_status = 'preparing') or
      (v_current = 'preparing' and p_new_status in ('ready', 'delivered')) or
      (v_current = 'ready' and p_new_status = 'delivered')
    ) then
      raise exception 'Invalid order status transition: % -> %', v_current, p_new_status using errcode = '22023';
    end if;

    update public.orders set status = p_new_status, updated_at = now()
     where id = p_record_id;

  elsif p_kind = 'booking' then
    select b.status into v_current
      from public.bookings b
      join public.public_trainers t on t.id = b.trainer_id
     where b.id = p_record_id and t.user_id = v_user_id
     for update of b;

    if not found then
      raise exception 'Booking not found or not owned by this trainer' using errcode = '42501';
    end if;
    if v_current <> 'confirmed' or p_new_status <> 'completed' then
      raise exception 'Invalid booking status transition: % -> %', v_current, p_new_status using errcode = '22023';
    end if;

    update public.bookings set status = 'completed', updated_at = now()
     where id = p_record_id;

  elsif p_kind = 'partnership' then
    select ip.status into v_current
      from public.influencer_partnerships ip
      join public.influencers i on i.id = ip.influencer_id
     where ip.id = p_record_id and i.user_id = v_user_id
     for update of ip;

    if not found then
      raise exception 'Partnership not found or not owned by this influencer' using errcode = '42501';
    end if;
    if v_current <> 'paid' or p_new_status not in ('accepted', 'declined') then
      raise exception 'Invalid partnership status transition: % -> %', v_current, p_new_status using errcode = '22023';
    end if;

    update public.influencer_partnerships
       set status = p_new_status, updated_at = now()
     where id = p_record_id;

  elsif p_kind = 'brand_partnership' then
    select ip.status into v_current
      from public.influencer_partnerships ip
     where ip.id = p_record_id and ip.brand_user_id = v_user_id
     for update;

    if not found then
      raise exception 'Partnership not found or not owned by this account' using errcode = '42501';
    end if;
    if v_current <> 'pending' or p_new_status <> 'cancelled' then
      raise exception 'Invalid partnership status transition: % -> %', v_current, p_new_status using errcode = '22023';
    end if;

    update public.influencer_partnerships
       set status = 'cancelled', updated_at = now()
     where id = p_record_id;
  else
    raise exception 'Unknown marketplace record kind' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.transition_marketplace_record(text, uuid, text) from public, anon;
grant execute on function public.transition_marketplace_record(text, uuid, text) to authenticated;

-- ── Live session authorization and presence ─────────────────
drop policy if exists "live_sessions_trainer_all" on public.live_sessions;
drop policy if exists "live_sessions_premium_read" on public.live_sessions;

create policy "live_sessions_host_insert"
  on public.live_sessions for insert
  with check (
    auth.uid() = trainer_id
    and exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role in ('trainer', 'admin')
    )
  );

create policy "live_sessions_host_update"
  on public.live_sessions for update
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

create policy "live_sessions_host_delete"
  on public.live_sessions for delete
  using (auth.uid() = trainer_id);

create policy "live_sessions_authorized_read"
  on public.live_sessions for select
  using (
    auth.uid() = trainer_id
    or exists (
      select 1 from public.profiles p
       where p.id = auth.uid() and p.role = 'admin'
    )
    or (
      status = 'live'
      and exists (
        select 1 from public.subscriptions s
         where s.user_id = auth.uid()
           and s.status = 'active'
           and s.plan in ('pro', 'elite')
           and coalesce(s.starts_at, now()) <= now()
           and (s.ends_at is null or s.ends_at > now())
      )
    )
  );

drop policy if exists "live_chat_premium_read" on public.live_chat;
drop policy if exists "live_chat_insert" on public.live_chat;

create policy "live_chat_authorized_read"
  on public.live_chat for select
  using (
    exists (
      select 1 from public.live_sessions ls
       where ls.id = session_id
    )
  );

create policy "live_chat_authorized_insert"
  on public.live_chat for insert
  with check (
    auth.uid() = user_id
    and length(trim(message)) between 1 and 500
    and exists (
      select 1 from public.live_sessions ls
       where ls.id = session_id
         and ls.status = 'live'
         and (
           (ls.trainer_id = auth.uid() and is_trainer = true)
           or (
             is_trainer = false
             and exists (
               select 1 from public.subscriptions s
                where s.user_id = auth.uid()
                  and s.status = 'active'
                  and s.plan in ('pro', 'elite')
                  and (s.ends_at is null or s.ends_at > now())
             )
           )
         )
    )
  );

create table if not exists public.live_viewer_presence (
  session_id uuid references public.live_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

alter table public.live_viewer_presence enable row level security;
revoke all on public.live_viewer_presence from anon, authenticated;

create or replace function public.update_live_viewer_count(
  p_session_id uuid,
  p_delta integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_delta not in (-1, 1) then
    raise exception 'Viewer delta must be -1 or 1' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.live_sessions ls
     where ls.id = p_session_id
       and ls.status = 'live'
       and (
         ls.trainer_id = v_user_id
         or exists (
           select 1 from public.profiles p
            where p.id = v_user_id and p.role = 'admin'
         )
         or exists (
           select 1 from public.subscriptions s
            where s.user_id = v_user_id
              and s.status = 'active'
              and s.plan in ('pro', 'elite')
              and (s.ends_at is null or s.ends_at > now())
         )
       )
  ) then
    raise exception 'Live session is unavailable' using errcode = '42501';
  end if;

  if p_delta = 1 then
    insert into public.live_viewer_presence (session_id, user_id)
    values (p_session_id, v_user_id)
    on conflict (session_id, user_id) do update set joined_at = now();
  else
    delete from public.live_viewer_presence
     where session_id = p_session_id and user_id = v_user_id;
  end if;

  select count(*)::integer into v_count
    from public.live_viewer_presence
   where session_id = p_session_id;

  update public.live_sessions
     set viewer_count = v_count,
         viewer_peak = greatest(coalesce(viewer_peak, 0), v_count)
   where id = p_session_id;
end;
$$;

revoke all on function public.update_live_viewer_count(uuid, integer) from public, anon;
grant execute on function public.update_live_viewer_count(uuid, integer) to authenticated;

-- ── Authoritative daily stats and automatic goals ───────────
alter table public.workout_sessions
  add column if not exists completed_at timestamptz;

update public.workout_sessions
   set completed_at = coalesce(completed_at, created_at)
 where completed = true and completed_at is null;

create or replace function public.set_workout_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.completed = true and (tg_op = 'INSERT' or coalesce(old.completed, false) = false) then
    new.completed_at := coalesce(new.completed_at, now());
  elsif new.completed = false then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists set_workout_completed_at on public.workout_sessions;
create trigger set_workout_completed_at
  before insert or update of completed on public.workout_sessions
  for each row execute function public.set_workout_completed_at();

create or replace function public.sync_daily_stats_for_user(
  p_user_id uuid,
  p_date date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_stats (
    user_id, date, calories_burned, workouts_completed, water_intake, calories_consumed
  )
  values (
    p_user_id,
    p_date,
    coalesce((
      select sum(greatest(coalesce(w.calories_burned, 0), 0))::integer
        from public.workout_sessions w
       where w.user_id = p_user_id and w.date = p_date and w.completed = true
    ), 0),
    (
      select count(*)::integer from public.workout_sessions w
       where w.user_id = p_user_id and w.date = p_date and w.completed = true
    ),
    coalesce((
      select ds.water_intake from public.daily_stats ds
       where ds.user_id = p_user_id and ds.date = p_date
    ), 0),
    coalesce((
      select sum(greatest(coalesce(m.calories, 0), 0))::integer
        from public.meal_logs m
       where m.user_id = p_user_id and m.date = p_date and m.eaten = true
    ), 0)
  )
  on conflict (user_id, date) do update
    set calories_burned = excluded.calories_burned,
        workouts_completed = excluded.workouts_completed,
        calories_consumed = excluded.calories_consumed;
end;
$$;

create or replace function public.sync_automatic_goals(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_goal record;
  v_value numeric;
begin
  for v_goal in
    select * from public.goals
     where user_id = p_user_id
       and type in ('workouts', 'calories', 'streak', 'weight')
  loop
    if v_goal.type = 'workouts' then
      select count(*)::numeric into v_value
        from public.workout_sessions w
       where w.user_id = p_user_id
         and w.completed = true
         and w.date >= v_goal.created_at::date
         and (v_goal.deadline is null or w.date <= v_goal.deadline);
    elsif v_goal.type = 'calories' then
      select coalesce(sum(greatest(coalesce(w.calories_burned, 0), 0)), 0)::numeric
        into v_value
        from public.workout_sessions w
       where w.user_id = p_user_id
         and w.completed = true
         and w.date >= v_goal.created_at::date
         and (v_goal.deadline is null or w.date <= v_goal.deadline);
    elsif v_goal.type = 'streak' then
      with workout_days as (
        select distinct w.date
          from public.workout_sessions w
         where w.user_id = p_user_id and w.completed = true
      ),
      numbered as (
        select date, date - row_number() over (order by date)::integer as island
          from workout_days
      ),
      latest as (
        select count(*)::numeric as length, max(date) as last_date
          from numbered group by island order by last_date desc limit 1
      )
      select case when last_date in (current_date, current_date - 1) then length else 0 end
        into v_value from latest;
      v_value := coalesce(v_value, 0);
    else
      select coalesce(p.weight, v_goal.current, 0)::numeric into v_value
        from public.profiles p where p.id = p_user_id;
    end if;

    update public.goals
       set current = v_value,
           completed = case
             when v_goal.type = 'weight' and coalesce(v_goal.start_value, v_goal.current) > v_goal.target
               then v_value <= v_goal.target
             else v_value >= v_goal.target
           end,
           updated_at = now()
     where id = v_goal.id;
  end loop;
end;
$$;

create or replace function public.fitness_source_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := coalesce(new.user_id, old.user_id);
  v_date date := coalesce(new.date, old.date);
  v_username text;
begin
  perform public.sync_daily_stats_for_user(v_user_id, v_date);
  perform public.sync_automatic_goals(v_user_id);

  if tg_table_name = 'meal_logs'
     and tg_op <> 'DELETE'
     and new.eaten = true
     and (tg_op = 'INSERT' or coalesce(old.eaten, false) = false) then
    select coalesce(nullif(trim(p.name), ''), 'Member') into v_username
      from public.profiles p where p.id = new.user_id;

    insert into public.activity_feed (
      user_id, username, action_type, action_description, metadata, event_key
    )
    values (
      new.user_id,
      coalesce(v_username, 'Member'),
      'meal',
      format('logged %s', new.name),
      jsonb_build_object('meal_id', new.id, 'calories', greatest(coalesce(new.calories, 0), 0)),
      'meal:' || new.id::text || ':eaten'
    )
    on conflict (event_key) where event_key is not null do nothing;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists fitness_workout_source_changed on public.workout_sessions;
create trigger fitness_workout_source_changed
  after insert or update or delete on public.workout_sessions
  for each row execute function public.fitness_source_changed();

drop trigger if exists fitness_meal_source_changed on public.meal_logs;
create trigger fitness_meal_source_changed
  after insert or update or delete on public.meal_logs
  for each row execute function public.fitness_source_changed();

create or replace function public.profile_weight_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.weight is distinct from old.weight then
    perform public.sync_automatic_goals(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists profile_weight_changed on public.profiles;
create trigger profile_weight_changed
  after update of weight on public.profiles
  for each row execute function public.profile_weight_changed();

revoke all on function public.sync_daily_stats_for_user(uuid, date) from public, anon, authenticated;
revoke all on function public.sync_automatic_goals(uuid) from public, anon, authenticated;
revoke all on function public.fitness_source_changed() from public, anon, authenticated;
revoke all on function public.profile_weight_changed() from public, anon, authenticated;

-- Backfill source-derived stats and goals.
do $$
declare
  v_row record;
  v_user_id uuid;
begin
  for v_row in
    select user_id, date from public.workout_sessions
    union
    select user_id, date from public.meal_logs
  loop
    perform public.sync_daily_stats_for_user(v_row.user_id, v_row.date);
  end loop;

  for v_user_id in select id from public.profiles
  loop
    perform public.sync_automatic_goals(v_user_id);
  end loop;
end;
$$;

do $$
declare
  v_table text;
begin
  foreach v_table in array array['daily_stats', 'goals', 'live_sessions'] loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end;
$$;

alter table public.daily_stats replica identity full;
alter table public.goals replica identity full;
alter table public.live_sessions replica identity full;
