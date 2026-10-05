-- Fix: fitness_source_changed() referenced new.eaten, which exists only on meal_logs.
-- The trigger also fires on workout_sessions, where that reference fails with
-- 'record "new" has no field "eaten"', blocking every workout insert, update and delete.
-- Reading the column through to_jsonb(new) makes the check safe for every table.

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
  v_eaten_now boolean;
  v_eaten_before boolean;
begin
  perform public.sync_daily_stats_for_user(v_user_id, v_date);
  perform public.sync_automatic_goals(v_user_id);

  if tg_table_name = 'meal_logs' and tg_op <> 'DELETE' then
    v_eaten_now := coalesce((to_jsonb(new) ->> 'eaten')::boolean, false);
    v_eaten_before := coalesce((to_jsonb(old) ->> 'eaten')::boolean, false);

    if v_eaten_now and (tg_op = 'INSERT' or not v_eaten_before) then
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
  end if;

  return coalesce(new, old);
end;
$$;
