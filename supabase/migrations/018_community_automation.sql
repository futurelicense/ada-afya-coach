-- Community automation
-- Progress is derived from source records; clients may only join through the
-- RPC below and can no longer write progress, completion, counts, or feed rows.

alter table public.community_challenges
  alter column participant_count set default 0;

update public.community_challenges
set participant_count = 0
where participant_count is null;

alter table public.community_challenges
  alter column participant_count set not null;

alter table public.challenge_participants
  add column if not exists reward_awarded_at timestamptz;

update public.challenge_participants
set current_value = 0
where current_value is null;

alter table public.challenge_participants
  alter column current_value set default 0,
  alter column current_value set not null;

alter table public.activity_feed
  add column if not exists event_key text;

create unique index if not exists activity_feed_event_key_uidx
  on public.activity_feed (event_key)
  where event_key is not null;

create index if not exists challenge_participants_user_idx
  on public.challenge_participants (user_id, challenge_id);

-- Remove the client-write paths that allowed progress/completion and activity
-- spoofing. Reads remain protected by the existing RLS policies.
drop policy if exists "cp_user_insert" on public.challenge_participants;
drop policy if exists "cp_user_update" on public.challenge_participants;
drop policy if exists "activity_feed_user_insert" on public.activity_feed;

revoke insert, update, delete on public.challenge_participants from anon, authenticated;
revoke insert, update, delete on public.activity_feed from anon, authenticated;
revoke update (participant_count) on public.community_challenges from anon, authenticated;

-- The old RPC blindly incremented a cached count and was replayable.
drop function if exists public.increment_challenge_participants(uuid);

-- Calculate progress only from records in the participant's challenge window.
-- Workout/calorie progress uses completed workout_sessions. Hydration uses
-- daily_stats days at or above 2.5 L. "days" workout/water challenges and
-- streak challenges use consecutive qualifying dates. There is no steps source
-- in the current schema, so steps challenges intentionally evaluate to zero.
create or replace function public.community_calculate_challenge_progress(
  p_challenge_id uuid,
  p_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_unit text;
  v_from date;
  v_to date;
  v_value bigint := 0;
begin
  select c.type,
         lower(c.target_unit),
         greatest(c.starts_at::date, cp.joined_at::date),
         least(c.ends_at::date, current_date)
    into v_type, v_unit, v_from, v_to
    from public.challenge_participants cp
    join public.community_challenges c on c.id = cp.challenge_id
   where cp.challenge_id = p_challenge_id
     and cp.user_id = p_user_id;

  if not found or v_from > v_to then
    return 0;
  end if;

  if v_type = 'calories' then
    select coalesce(sum(greatest(coalesce(ws.calories_burned, 0), 0)), 0)
      into v_value
      from public.workout_sessions ws
     where ws.user_id = p_user_id
       and ws.completed = true
       and ws.date between v_from and v_to;

  elsif v_type = 'workouts' and v_unit = 'days' then
    with workout_days as (
      select distinct ws.date
        from public.workout_sessions ws
       where ws.user_id = p_user_id
         and ws.completed = true
         and ws.date between v_from and v_to
    ),
    islands as (
      select date - row_number() over (order by date)::integer as island
        from workout_days
    )
    select coalesce(max(day_count), 0)
      into v_value
      from (select count(*) as day_count from islands group by island) streaks;

  elsif v_type = 'workouts' then
    select count(*)
      into v_value
      from public.workout_sessions ws
     where ws.user_id = p_user_id
       and ws.completed = true
       and ws.date between v_from and v_to;

  elsif v_type = 'water' then
    with hydrated_days as (
      select distinct ds.date
        from public.daily_stats ds
       where ds.user_id = p_user_id
         and ds.date between v_from and v_to
         and coalesce(ds.water_intake, 0) >= 2.5
    ),
    islands as (
      select date - row_number() over (order by date)::integer as island
        from hydrated_days
    )
    select coalesce(max(day_count), 0)
      into v_value
      from (select count(*) as day_count from islands group by island) streaks;

  elsif v_type = 'streak' then
    with workout_days as (
      select distinct ws.date
        from public.workout_sessions ws
       where ws.user_id = p_user_id
         and ws.completed = true
         and ws.date between v_from and v_to
    ),
    islands as (
      select date - row_number() over (order by date)::integer as island
        from workout_days
    )
    select coalesce(max(day_count), 0)
      into v_value
      from (select count(*) as day_count from islands group by island) streaks;
  end if;

  return least(v_value, 2147483647)::integer;
end;
$$;

create or replace function public.community_refresh_user_progress(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant record;
  v_progress integer;
  v_completed_now boolean;
  v_username text;
begin
  select coalesce(nullif(trim(p.name), ''), 'Member')
    into v_username
    from public.profiles p
   where p.id = p_user_id;
  v_username := coalesce(v_username, 'Member');

  for v_participant in
    select cp.id,
           cp.challenge_id,
           cp.current_value,
           cp.completed_at,
           cp.reward_awarded_at,
           c.title,
           c.target_value,
           greatest(coalesce(c.reward_points, 0), 0) as reward_points,
           c.badge_name
      from public.challenge_participants cp
      join public.community_challenges c on c.id = cp.challenge_id
     where cp.user_id = p_user_id
       and c.is_active = true
       and c.starts_at <= now()
     for update of cp
  loop
    v_progress := public.community_calculate_challenge_progress(
      v_participant.challenge_id,
      p_user_id
    );
    v_completed_now :=
      v_progress >= v_participant.target_value
      and v_participant.reward_awarded_at is null;

    update public.challenge_participants
       set current_value = case
             when reward_awarded_at is not null
               then greatest(current_value, v_progress, v_participant.target_value)
             else v_progress
           end,
           completed_at = case
             when v_progress >= v_participant.target_value
               then coalesce(completed_at, now())
             when reward_awarded_at is null
               then null
             else completed_at
           end,
           reward_awarded_at = case
             when v_completed_now then now()
             else reward_awarded_at
           end
     where id = v_participant.id;

    if v_completed_now then
      insert into public.gamification (user_id, points, earned_badges, updated_at)
      values (
        p_user_id,
        v_participant.reward_points,
        case
          when nullif(trim(v_participant.badge_name), '') is null then '{}'::text[]
          else array[v_participant.badge_name]
        end,
        now()
      )
      on conflict (user_id) do update
        set points = coalesce(gamification.points, 0) + excluded.points,
            level = greatest(
              coalesce(gamification.level, 1),
              floor(
                (coalesce(gamification.points, 0) + excluded.points) / 1000.0
              )::integer + 1
            ),
            earned_badges = case
              when nullif(trim(v_participant.badge_name), '') is null
                or v_participant.badge_name = any(coalesce(gamification.earned_badges, '{}'::text[]))
                then coalesce(gamification.earned_badges, '{}'::text[])
              else array_append(
                coalesce(gamification.earned_badges, '{}'::text[]),
                v_participant.badge_name
              )
            end,
            updated_at = now();

      insert into public.activity_feed (
        user_id,
        username,
        action_type,
        action_description,
        metadata,
        event_key
      )
      values (
        p_user_id,
        v_username,
        'challenge',
        format('completed the %s challenge', v_participant.title),
        jsonb_build_object(
          'challenge_id', v_participant.challenge_id,
          'reward_points', v_participant.reward_points,
          'badge_name', v_participant.badge_name
        ),
        'challenge:' || v_participant.challenge_id::text || ':user:' || p_user_id::text || ':completed'
      )
      on conflict (event_key) where event_key is not null do nothing;
    end if;
  end loop;
end;
$$;

create or replace function public.community_workout_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_username text;
begin
  v_user_id := coalesce(new.user_id, old.user_id);

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.community_refresh_user_progress(old.user_id);
  end if;

  if tg_op <> 'DELETE'
     and new.completed = true
     and (tg_op = 'INSERT' or coalesce(old.completed, false) = false) then
    select coalesce(nullif(trim(p.name), ''), 'Member')
      into v_username
      from public.profiles p
     where p.id = new.user_id;

    insert into public.activity_feed (
      user_id,
      username,
      action_type,
      action_description,
      metadata,
      event_key
    )
    values (
      new.user_id,
      coalesce(v_username, 'Member'),
      'workout',
      format('completed %s', new.name),
      jsonb_build_object(
        'workout_id', new.id,
        'calories_burned', greatest(coalesce(new.calories_burned, 0), 0)
      ),
      'workout:' || new.id::text || ':completed'
    )
    on conflict (event_key) where event_key is not null do nothing;
  end if;

  perform public.community_refresh_user_progress(v_user_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists community_workout_changed on public.workout_sessions;
create trigger community_workout_changed
  after insert or update or delete on public.workout_sessions
  for each row execute function public.community_workout_changed();

create or replace function public.community_daily_stats_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.community_refresh_user_progress(old.user_id);
  end if;

  perform public.community_refresh_user_progress(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists community_daily_stats_changed on public.daily_stats;
create trigger community_daily_stats_changed
  after insert or update or delete on public.daily_stats
  for each row execute function public.community_daily_stats_changed();

create or replace function public.community_sync_participant_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge_id uuid;
begin
  v_challenge_id := coalesce(new.challenge_id, old.challenge_id);

  update public.community_challenges c
     set participant_count = (
       select count(*)::integer
         from public.challenge_participants cp
        where cp.challenge_id = v_challenge_id
     )
   where c.id = v_challenge_id;

  if tg_op = 'UPDATE' and old.challenge_id is distinct from new.challenge_id then
    update public.community_challenges c
       set participant_count = (
         select count(*)::integer
           from public.challenge_participants cp
          where cp.challenge_id = old.challenge_id
       )
     where c.id = old.challenge_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists community_participant_count_changed on public.challenge_participants;
create trigger community_participant_count_changed
  after insert or delete or update of challenge_id on public.challenge_participants
  for each row execute function public.community_sync_participant_count();

-- Joining is an authenticated, replay-safe operation. The unique participant
-- constraint and event key make retries harmless.
create or replace function public.join_community_challenge(p_challenge_id uuid)
returns public.challenge_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_participant public.challenge_participants;
  v_title text;
  v_username text;
  v_inserted boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select c.title
    into v_title
    from public.community_challenges c
   where c.id = p_challenge_id
     and c.is_active = true
     and c.starts_at <= now()
     and c.ends_at > now()
   for update;

  if not found then
    raise exception 'Challenge is not available';
  end if;

  insert into public.challenge_participants (challenge_id, user_id)
  values (p_challenge_id, v_user_id)
  on conflict (challenge_id, user_id) do nothing
  returning * into v_participant;

  v_inserted := found;

  if not v_inserted then
    select *
      into v_participant
      from public.challenge_participants cp
     where cp.challenge_id = p_challenge_id
       and cp.user_id = v_user_id;
  else
    select coalesce(nullif(trim(p.name), ''), 'Member')
      into v_username
      from public.profiles p
     where p.id = v_user_id;

    insert into public.activity_feed (
      user_id,
      username,
      action_type,
      action_description,
      metadata,
      event_key
    )
    values (
      v_user_id,
      coalesce(v_username, 'Member'),
      'joined',
      format('joined the %s challenge', v_title),
      jsonb_build_object('challenge_id', p_challenge_id),
      'challenge:' || p_challenge_id::text || ':user:' || v_user_id::text || ':joined'
    )
    on conflict (event_key) where event_key is not null do nothing;
  end if;

  perform public.community_refresh_user_progress(v_user_id);

  select *
    into v_participant
    from public.challenge_participants cp
   where cp.challenge_id = p_challenge_id
     and cp.user_id = v_user_id;

  return v_participant;
end;
$$;

revoke all on function public.community_calculate_challenge_progress(uuid, uuid) from public;
revoke all on function public.community_refresh_user_progress(uuid) from public;
revoke all on function public.community_workout_changed() from public;
revoke all on function public.community_daily_stats_changed() from public;
revoke all on function public.community_sync_participant_count() from public;
revoke all on function public.join_community_challenge(uuid) from public;
grant execute on function public.join_community_challenge(uuid) to authenticated;

-- Correct any pre-migration cached counts and replace client-supplied progress
-- with authoritative values. Existing unawarded completion timestamps are
-- revalidated by community_refresh_user_progress.
update public.community_challenges c
   set participant_count = (
     select count(*)::integer
       from public.challenge_participants cp
      where cp.challenge_id = c.id
   );

do $$
declare
  v_user_id uuid;
begin
  for v_user_id in
    select distinct cp.user_id from public.challenge_participants cp
  loop
    perform public.community_refresh_user_progress(v_user_id);
  end loop;
end;
$$;

-- Feed inserts, progress updates, and participant totals should reach the
-- Community page without a reload.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'activity_feed',
    'challenge_participants',
    'community_challenges'
  ] loop
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = v_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        v_table
      );
    end if;
  end loop;
end;
$$;

alter table public.challenge_participants replica identity full;
alter table public.community_challenges replica identity full;
