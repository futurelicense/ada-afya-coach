-- Rank the community from completed workouts, not from seeded gamification rows.
-- A member with no finished session no longer appears, and points are 100 per workout.

create or replace view public.leaderboard as
with completed as (
  select
    user_id,
    date::date as workout_date,
    coalesce(calories_burned, 0) as calories
  from public.workout_sessions
  where completed = true
),
counts as (
  select
    user_id,
    count(*)::int as workout_count,
    coalesce(sum(calories), 0)::int as total_calories
  from completed
  group by user_id
),
days as (
  select distinct user_id, workout_date
  from completed
),
islands as (
  select
    user_id,
    workout_date,
    workout_date - (row_number() over (partition by user_id order by workout_date))::int as grp
  from days
),
runs as (
  select user_id, count(*)::int as len, max(workout_date) as end_date
  from islands
  group by user_id, grp
),
streaks as (
  select
    user_id,
    max(len) as longest_streak,
    coalesce(max(len) filter (where end_date in (current_date, current_date - 1)), 0) as current_streak
  from runs
  group by user_id
)
select
  row_number() over (order by c.workout_count desc, c.total_calories desc) as rank,
  p.name,
  (c.workout_count * 100) as points,
  ((c.workout_count * 100) / 1000 + 1) as level,
  coalesce(s.current_streak, 0) as streak,
  coalesce(s.longest_streak, 0) as longest_streak,
  c.workout_count as total_workouts,
  c.total_calories
from counts c
join public.profiles p on p.id = c.user_id
left join streaks s on s.user_id = c.user_id
where c.workout_count > 0
order by c.workout_count desc, c.total_calories desc
limit 50;

grant select on public.leaderboard to authenticated;

-- Drop seeded scores. The next profile load rebuilds a member's row from their workouts.
update public.gamification
set
  points = 0,
  level = 1,
  current_streak = 0,
  longest_streak = 0,
  earned_badges = '{}',
  updated_at = now();

-- Remove the highlight lines the seed script invented. Real posts use other wording.
delete from public.activity_feed
where action_description ilike '%Iron Will badge%'
   or action_description ilike '%HIIT Finisher%'
   or action_description ilike '%14-day workout streak%'
   or action_description ilike '%crushed Leg Day%'
   or action_description ilike '%Burn 5,000 Calories challenge%'
   or action_description ilike '%Jollof Rice + Grilled Chicken%'
   or action_description ilike '%welcome to the movement%'
   or action_description ilike '%Rank #1 on the leaderboard%'
   or action_description ilike '%21-day streak%'
   or action_description ilike '%Gym Circuit%';
