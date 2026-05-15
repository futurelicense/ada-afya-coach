-- ─────────────────────────────────────────────────────
-- Phase 6: Community & Social
-- ─────────────────────────────────────────────────────

-- Community challenges
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  type                TEXT NOT NULL CHECK (type IN ('calories','workouts','streak','water','steps')),
  target_value        INTEGER NOT NULL,
  target_unit         TEXT NOT NULL,
  reward_description  TEXT,
  reward_points       INTEGER DEFAULT 0,
  badge_name          TEXT,
  starts_at           TIMESTAMPTZ DEFAULT now(),
  ends_at             TIMESTAMPTZ NOT NULL,
  participant_count   INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
-- All authenticated users can read active challenges
CREATE POLICY "challenges_authenticated_read" ON public.community_challenges
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
-- Only service role can create/modify challenges (admin UI or Edge Function)
CREATE POLICY "challenges_service_write" ON public.community_challenges
  FOR ALL USING (auth.role() = 'service_role');


-- Challenge participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  joined_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_user_read"   ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cp_user_insert" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp_user_update" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);


-- Activity feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username           TEXT NOT NULL,
  action_type        TEXT NOT NULL CHECK (action_type IN ('workout','achievement','streak','challenge','rank','meal','joined')),
  action_description TEXT NOT NULL,
  metadata           JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_feed_created_idx ON public.activity_feed (created_at DESC);

ALTER TABLE public.activity_feed REPLICA IDENTITY FULL;

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
-- All authenticated users can read the feed
CREATE POLICY "activity_feed_auth_read" ON public.activity_feed
  FOR SELECT USING (auth.role() = 'authenticated');
-- Users can only insert their own entries
CREATE POLICY "activity_feed_user_insert" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── Leaderboard view (no RLS bypass needed — view runs as postgres) ─

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  ROW_NUMBER() OVER (ORDER BY g.points DESC) AS rank,
  p.name,
  g.points,
  g.level,
  g.current_streak   AS streak,
  g.longest_streak,
  COALESCE(ws.workout_count, 0) AS total_workouts,
  COALESCE(ws.total_calories, 0) AS total_calories
FROM public.profiles p
JOIN public.gamification g ON g.user_id = p.id
LEFT JOIN (
  SELECT user_id,
         COUNT(*)                         AS workout_count,
         COALESCE(SUM(calories_burned), 0) AS total_calories
    FROM public.workout_sessions
   WHERE completed = true
   GROUP BY user_id
) ws ON ws.user_id = p.id
ORDER BY g.points DESC
LIMIT 50;

GRANT SELECT ON public.leaderboard TO authenticated;


-- ── Seed initial challenges ──────────────────────────

INSERT INTO public.community_challenges
  (title, description, type, target_value, target_unit, reward_description, reward_points, badge_name, ends_at)
VALUES
  ('30-Day Fitness Challenge',
   'Complete at least one workout every day for 30 days straight. Rest days count if you stretch for 10+ minutes.',
   'workouts', 30, 'days',
   'Gold Badge + 1,000 bonus points', 1000, 'Iron Will',
   now() + interval '30 days'),

  ('Burn 5,000 Calories This Week',
   'Torch 5,000 total calories this week through any combination of workouts. All activity types count.',
   'calories', 5000, 'kcal',
   'Silver Badge + 500 bonus points', 500, 'Inferno Week',
   now() + interval '7 days'),

  ('Morning Warriors',
   'Complete 5 workouts before 9AM this week. Early risers get a metabolic edge — prove it!',
   'workouts', 5, 'sessions',
   'Bronze Badge + 250 bonus points', 250, 'Early Bird',
   now() + interval '7 days'),

  ('Hydration Nation',
   'Hit your 2.5L daily water target for 14 consecutive days. Consistency is everything.',
   'water', 14, 'days',
   'Hydration Hero Badge + 300 bonus points', 300, 'Hydration Hero',
   now() + interval '14 days')

ON CONFLICT DO NOTHING;


-- ── Seed 8 activity feed entries ────────────────────

-- (These are seed entries for display; real entries are inserted by app events)
-- Use auth.uid() placeholder — replaced with a real admin user ID if needed
-- Leave as a comment since we don't have a real user_id to reference here.
-- The app will populate this table as users complete workouts and earn badges.
