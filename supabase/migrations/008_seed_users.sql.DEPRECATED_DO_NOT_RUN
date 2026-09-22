-- ═══════════════════════════════════════════════════════════════════
-- WeFit — Seed Users (one per role)
-- ═══════════════════════════════════════════════════════════════════
-- Password for ALL seed accounts: WeFit@2025
--
-- Accounts created:
--   user@wefit.ng        → regular member (Pro)
--   vendor@wefit.ng      → meal vendor (Free)
--   trainer@wefit.ng     → certified trainer (Elite)
--   gymowner@wefit.ng    → gym owner (Pro)
--   influencer@wefit.ng  → fitness influencer (Elite)
--   admin@wefit.ng       → platform admin (Elite + superadmin)
--
-- Run once. Safe to re-run (all inserts use ON CONFLICT DO NOTHING).
-- ═══════════════════════════════════════════════════════════════════

-- Ensure pgcrypto is available for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
SET search_path TO public, extensions;

-- Add 'admin' to the profiles.role check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user','vendor','trainer','gym_owner','influencer','admin'));

-- ── Seed users in a single block ────────────────────────────────
DO $$
DECLARE
  -- Fixed UUIDs make this migration idempotent
  uid_user        CONSTANT UUID := 'a0000001-0001-0001-0001-000000000001';
  uid_vendor      CONSTANT UUID := 'a0000002-0002-0002-0002-000000000002';
  uid_trainer     CONSTANT UUID := 'a0000003-0003-0003-0003-000000000003';
  uid_gymowner    CONSTANT UUID := 'a0000004-0004-0004-0004-000000000004';
  uid_influencer  CONSTANT UUID := 'a0000005-0005-0005-0005-000000000005';
  uid_admin       CONSTANT UUID := 'a0000006-0006-0006-0006-000000000006';

  hashed_pw TEXT;
BEGIN
  hashed_pw := crypt('WeFit@2025', gen_salt('bf', 10));

  -- ── 1. auth.users ──────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin,
    created_at, updated_at
  ) VALUES
    (uid_user,       '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'user@wefit.ng',       hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),

    (uid_vendor,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'vendor@wefit.ng',     hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),

    (uid_trainer,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'trainer@wefit.ng',    hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),

    (uid_gymowner,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'gymowner@wefit.ng',   hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),

    (uid_influencer, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'influencer@wefit.ng', hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),

    (uid_admin,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@wefit.ng',      hashed_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', true,  now(), now())

  ON CONFLICT (id) DO NOTHING;

  -- ── 2. auth.identities (email provider) ────────────────────
  --    provider_id = email for the 'email' provider
  INSERT INTO auth.identities (
    provider_id, user_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at
  ) VALUES
    ('user@wefit.ng',       uid_user,
     jsonb_build_object('sub', uid_user::text,       'email', 'user@wefit.ng'),
     'email', now(), now(), now()),

    ('vendor@wefit.ng',     uid_vendor,
     jsonb_build_object('sub', uid_vendor::text,     'email', 'vendor@wefit.ng'),
     'email', now(), now(), now()),

    ('trainer@wefit.ng',    uid_trainer,
     jsonb_build_object('sub', uid_trainer::text,    'email', 'trainer@wefit.ng'),
     'email', now(), now(), now()),

    ('gymowner@wefit.ng',   uid_gymowner,
     jsonb_build_object('sub', uid_gymowner::text,   'email', 'gymowner@wefit.ng'),
     'email', now(), now(), now()),

    ('influencer@wefit.ng', uid_influencer,
     jsonb_build_object('sub', uid_influencer::text, 'email', 'influencer@wefit.ng'),
     'email', now(), now(), now()),

    ('admin@wefit.ng',      uid_admin,
     jsonb_build_object('sub', uid_admin::text,      'email', 'admin@wefit.ng'),
     'email', now(), now(), now())

  ON CONFLICT (provider_id, provider) DO NOTHING;

END $$;


-- ── 3. Profiles ────────────────────────────────────────────────────
INSERT INTO public.profiles (
  id, name, email, age, weight, height,
  fitness_level, goals, location, plan, role,
  diet_preference, onboarding_done, join_date
) VALUES
  ('a0000001-0001-0001-0001-000000000001',
   'Chidi Okonkwo',   'user@wefit.ng',       26, 78.5, 178,
   'intermediate', ARRAY['build-muscle','lose-weight'], 'Lagos',   'pro',   'user',
   'everything', true, current_date - 60),

  ('a0000002-0002-0002-0002-000000000002',
   'Kemi Adeyemi',    'vendor@wefit.ng',     34, 64.0, 161,
   'beginner',     ARRAY['stay-fit'],                  'Abuja',   'free',  'vendor',
   'vegetarian', true, current_date - 45),

  ('a0000003-0003-0003-0003-000000000003',
   'Emeka Nwosu',     'trainer@wefit.ng',    29, 86.0, 183,
   'advanced',     ARRAY['improve-endurance'],         'Lagos',   'elite', 'trainer',
   'everything', true, current_date - 90),

  ('a0000004-0004-0004-0004-000000000004',
   'Bola Adebisi',    'gymowner@wefit.ng',   43, 91.0, 181,
   'intermediate', ARRAY['stay-fit'],                  'Ibadan',  'pro',   'gym_owner',
   'everything', true, current_date - 120),

  ('a0000005-0005-0005-0005-000000000005',
   'Tunde Oladele',   'influencer@wefit.ng', 24, 71.0, 176,
   'advanced',     ARRAY['build-muscle'],              'Lagos',   'elite', 'influencer',
   'everything', true, current_date - 30),

  ('a0000006-0006-0006-0006-000000000006',
   'WeFit Admin',     'admin@wefit.ng',      30, 75.0, 175,
   'advanced',     ARRAY['stay-fit'],                  'Nigeria', 'elite', 'admin',
   'everything', true, current_date - 365)

ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  plan            = EXCLUDED.plan,
  role            = EXCLUDED.role,
  onboarding_done = EXCLUDED.onboarding_done,
  updated_at      = now();


-- ── 4. Gamification ────────────────────────────────────────────────
-- Points/levels/streaks set to realistic values per role.
INSERT INTO public.gamification (
  user_id, points, level, current_streak, longest_streak,
  last_active, earned_badges, updated_at
) VALUES
  ('a0000001-0001-0001-0001-000000000001',
    4200,  8,  14, 21, current_date,
    ARRAY['first_workout','week_warrior','calorie_crusher'], now()),

  ('a0000002-0002-0002-0002-000000000002',
     850,  3,   3,  7, current_date,
    ARRAY['first_workout'], now()),

  ('a0000003-0003-0003-0003-000000000003',
    9800, 15,  45, 60, current_date,
    ARRAY['first_workout','iron_will','inferno_week','early_bird','hydration_hero'], now()),

  ('a0000004-0004-0004-0004-000000000004',
    3100,  6,   7, 14, current_date,
    ARRAY['first_workout','week_warrior'], now()),

  ('a0000005-0005-0005-0005-000000000005',
    6750, 11,  21, 30, current_date,
    ARRAY['first_workout','week_warrior','iron_will'], now()),

  ('a0000006-0006-0006-0006-000000000006',
   99999, 99,  99, 99, current_date,
    ARRAY['first_workout','iron_will','inferno_week','early_bird','hydration_hero','admin'], now())

ON CONFLICT (user_id) DO UPDATE SET
  points         = EXCLUDED.points,
  level          = EXCLUDED.level,
  current_streak = EXCLUDED.current_streak,
  longest_streak = EXCLUDED.longest_streak,
  last_active    = EXCLUDED.last_active,
  earned_badges  = EXCLUDED.earned_badges,
  updated_at     = now();


-- ── 5. Sample workout sessions ────────────────────────────────────
INSERT INTO public.workout_sessions (
  user_id, name, date, duration, difficulty,
  calories, calories_burned, exercises, completed
) VALUES
  ('a0000001-0001-0001-0001-000000000001', 'Upper Body Blast',     current_date - 1, 45, 'intermediate', 380, 380, '[]'::jsonb, true),
  ('a0000001-0001-0001-0001-000000000001', 'Core & Cardio',        current_date,     30, 'intermediate', 250, 0,   '[]'::jsonb, false),
  ('a0000003-0003-0003-0003-000000000003', 'Full Body Power',      current_date - 1, 60, 'advanced',     520, 520, '[]'::jsonb, true),
  ('a0000003-0003-0003-0003-000000000003', 'HIIT Finisher',        current_date,     45, 'advanced',     440, 440, '[]'::jsonb, true),
  ('a0000005-0005-0005-0005-000000000005', 'Leg Day',              current_date - 1, 50, 'advanced',     410, 410, '[]'::jsonb, true),
  ('a0000004-0004-0004-0004-000000000004', 'Gym Circuit',          current_date - 2, 60, 'intermediate', 350, 350, '[]'::jsonb, true),
  ('a0000001-0001-0001-0001-000000000001', 'Chest & Triceps',      current_date - 3, 50, 'intermediate', 360, 360, '[]'::jsonb, true),
  ('a0000003-0003-0003-0003-000000000003', 'Morning Mobility',     current_date - 2, 30, 'beginner',     180, 180, '[]'::jsonb, true)
ON CONFLICT DO NOTHING;


-- ── 6. Sample meal logs ────────────────────────────────────────────
INSERT INTO public.meal_logs (
  user_id, name, meal_type, date, calories, protein, carbs, fats, eaten
) VALUES
  ('a0000001-0001-0001-0001-000000000001', 'Jollof Rice + Grilled Chicken', 'lunch',     current_date,     540, 38.0, 62.0, 12.0, true),
  ('a0000001-0001-0001-0001-000000000001', 'Pap + Akara',                   'breakfast', current_date,     320, 14.0, 48.0,  8.0, true),
  ('a0000001-0001-0001-0001-000000000001', 'Egusi Soup + Eba',              'dinner',    current_date,     620, 24.0, 72.0, 18.0, false),
  ('a0000003-0003-0003-0003-000000000003', 'Oatmeal + Banana',              'breakfast', current_date,     380, 12.0, 68.0,  7.0, true),
  ('a0000003-0003-0003-0003-000000000003', 'Ofada Rice + Ayamase',          'lunch',     current_date,     580, 28.0, 70.0, 16.0, true),
  ('a0000005-0005-0005-0005-000000000005', 'Protein Shake + Suya',          'breakfast', current_date,     450, 52.0, 22.0, 14.0, true)
ON CONFLICT DO NOTHING;


-- ── 7. Daily stats ─────────────────────────────────────────────────
INSERT INTO public.daily_stats (
  user_id, date, calories_burned, workouts_completed, water_intake, calories_consumed
) VALUES
  ('a0000001-0001-0001-0001-000000000001', current_date,     380,  1, 1.75,  860),
  ('a0000001-0001-0001-0001-000000000001', current_date - 1, 380,  1, 2.50, 1840),
  ('a0000003-0003-0003-0003-000000000003', current_date,     960,  2, 3.00, 1030),
  ('a0000003-0003-0003-0003-000000000003', current_date - 1, 700,  1, 3.00, 1960),
  ('a0000005-0005-0005-0005-000000000005', current_date,     410,  1, 2.25, 1450),
  ('a0000004-0004-0004-0004-000000000004', current_date - 2, 350,  1, 2.00, 1700)
ON CONFLICT (user_id, date) DO UPDATE SET
  calories_burned    = EXCLUDED.calories_burned,
  workouts_completed = EXCLUDED.workouts_completed,
  water_intake       = EXCLUDED.water_intake,
  calories_consumed  = EXCLUDED.calories_consumed;


-- ── 8. Activity feed ───────────────────────────────────────────────
INSERT INTO public.activity_feed (
  user_id, username, action_type, action_description, created_at
) VALUES
  ('a0000003-0003-0003-0003-000000000003', 'Emeka Nwosu',
   'achievement', 'earned the Iron Will badge 🏆',               now() - interval '1 hour'),

  ('a0000003-0003-0003-0003-000000000003', 'Emeka Nwosu',
   'workout',     'completed HIIT Finisher — 440 kcal burned 💪', now() - interval '2 hours'),

  ('a0000001-0001-0001-0001-000000000001', 'Chidi Okonkwo',
   'streak',      'hit a 14-day workout streak 🔥',               now() - interval '3 hours'),

  ('a0000005-0005-0005-0005-000000000005', 'Tunde Oladele',
   'workout',     'crushed Leg Day — 410 kcal burned 💪',         now() - interval '5 hours'),

  ('a0000004-0004-0004-0004-000000000004', 'Bola Adebisi',
   'challenge',   'joined the Burn 5,000 Calories challenge ⚡',  now() - interval '8 hours'),

  ('a0000001-0001-0001-0001-000000000001', 'Chidi Okonkwo',
   'meal',        'logged Jollof Rice + Grilled Chicken 🍽️',      now() - interval '10 hours'),

  ('a0000002-0002-0002-0002-000000000002', 'Kemi Adeyemi',
   'joined',      'joined WeFit — welcome to the movement! 🎉',   now() - interval '1 day'),

  ('a0000003-0003-0003-0003-000000000003', 'Emeka Nwosu',
   'rank',        'reached Rank #1 on the leaderboard 👑',        now() - interval '1 day'),

  ('a0000005-0005-0005-0005-000000000005', 'Tunde Oladele',
   'achievement', 'hit a 21-day streak — unstoppable! 🔥',        now() - interval '2 days'),

  ('a0000004-0004-0004-0004-000000000004', 'Bola Adebisi',
   'workout',     'completed Gym Circuit — 350 kcal burned 💪',   now() - interval '2 days')

ON CONFLICT DO NOTHING;


-- ── 9. Subscriptions for Pro/Elite seed users ─────────────────────
INSERT INTO public.subscriptions (
  user_id, plan, status, paystack_subscription_code,
  starts_at, ends_at, created_at
) VALUES
  ('a0000001-0001-0001-0001-000000000001', 'pro',   'active', 'SUB_seed_user',       now() - interval '30 days', now() + interval '30 days', now()),
  ('a0000003-0003-0003-0003-000000000003', 'elite', 'active', 'SUB_seed_trainer',    now() - interval '60 days', now() + interval '30 days', now()),
  ('a0000004-0004-0004-0004-000000000004', 'pro',   'active', 'SUB_seed_gymowner',   now() - interval '90 days', now() + interval '30 days', now()),
  ('a0000005-0005-0005-0005-000000000005', 'elite', 'active', 'SUB_seed_influencer', now() - interval '20 days', now() + interval '30 days', now()),
  ('a0000006-0006-0006-0006-000000000006', 'elite', 'active', 'SUB_seed_admin',      now() - interval '365 days',now() + interval '365 days', now())
ON CONFLICT DO NOTHING;


-- ── 10. Vendor entry ───────────────────────────────────────────────
INSERT INTO public.vendors (
  user_id, name, description,
  city, state, cuisine_types, is_verified
)
SELECT
  'a0000002-0002-0002-0002-000000000002',
  'Kemi''s Healthy Kitchen',
  'Delicious Nigerian meals — macro-tracked and freshly prepared daily in Abuja. Jollof, egusi, and more.',
  'Abuja', 'FCT',
  ARRAY['Nigerian Cuisine','Healthy','Meal Prep'],
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.vendors
  WHERE user_id = 'a0000002-0002-0002-0002-000000000002'
);


-- ── 11. Trainer entry ──────────────────────────────────────────────
INSERT INTO public.public_trainers (
  user_id, name, bio, specializations,
  city, state, certifications, rating
)
SELECT
  'a0000003-0003-0003-0003-000000000003',
  'Emeka Nwosu',
  'NSCA-certified strength & conditioning coach with 6 years training Nigerians to compete at their best. Specialises in fat loss, hypertrophy, and functional fitness.',
  ARRAY['Strength Training','HIIT','Fat Loss','Sports Conditioning'],
  'Lagos', 'Lagos',
  ARRAY['NSCA-CSCS','CPR/AED Certified'],
  4.9
WHERE NOT EXISTS (
  SELECT 1 FROM public.public_trainers
  WHERE user_id = 'a0000003-0003-0003-0003-000000000003'
);
