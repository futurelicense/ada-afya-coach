-- Fix leaderboard VIEW: gamification.current_streak was mistakenly referenced as g.streak
-- This replaces the view with the correct column alias.

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  ROW_NUMBER() OVER (ORDER BY g.points DESC) AS rank,
  p.name,
  g.points,
  g.level,
  g.current_streak   AS streak,
  g.longest_streak,
  COALESCE(ws.workout_count, 0)  AS total_workouts,
  COALESCE(ws.total_calories, 0) AS total_calories
FROM public.profiles p
JOIN public.gamification g ON g.user_id = p.id
LEFT JOIN (
  SELECT user_id,
         COUNT(*)                          AS workout_count,
         COALESCE(SUM(calories_burned), 0) AS total_calories
    FROM public.workout_sessions
   WHERE completed = true
   GROUP BY user_id
) ws ON ws.user_id = p.id
ORDER BY g.points DESC
LIMIT 50;

GRANT SELECT ON public.leaderboard TO authenticated;
