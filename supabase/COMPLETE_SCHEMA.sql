-- ═══════════════════════════════════════════════════════════════════
-- WeFit — Complete Schema (consolidated)
-- ═══════════════════════════════════════════════════════════════════
-- Single-file source of truth. Run this once against a fresh Supabase
-- project (SQL Editor, or `supabase db push` against an empty DB) to
-- create every table, policy, function, trigger, storage bucket, and
-- reference-data seed used by the app.
--
-- Consolidates migrations 001–007. It intentionally leaves out the
-- old 008_seed_users.sql approach: inserting directly into auth.users
-- via SQL leaves NULL confirmation/recovery token fields that GoTrue
-- rejects with 500s on login. Seed accounts must be created through
-- the Supabase Admin API instead — see scripts/seed-users.mjs, which
-- creates one user per role with password: OneFitness
--
-- After running this file:
--   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-users.mjs
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- Phase 1: Core schema (profiles, tracking, gamification)
-- ═══════════════════════════════════════════════════════════════════

-- ── PROFILES ────────────────────────────────────────────────
-- Auto-created on signup via trigger (see bottom of file)
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text,
  email            text,
  age              int,
  gender           text,
  weight           numeric(5,1),
  target_weight    numeric(5,1),
  height           numeric(5,1),
  fitness_level    text check (fitness_level in ('beginner', 'intermediate', 'advanced')) default 'intermediate',
  goals            text[] default '{}',
  location         text,
  plan             text check (plan in ('free', 'pro', 'elite')) default 'free',
  role             text check (role in ('user', 'vendor', 'trainer', 'gym_owner', 'influencer', 'admin')) default 'user',
  diet_preference  text,
  join_date        date default current_date,
  onboarding_done  boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── WORKOUT SESSIONS ────────────────────────────────────────
create table public.workout_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  description     text,
  date            date not null default current_date,
  duration        int not null default 30,        -- minutes
  difficulty      text check (difficulty in ('beginner', 'intermediate', 'advanced')) default 'intermediate',
  calories        int default 0,
  calories_burned int default 0,
  exercises       jsonb not null default '[]',    -- array of exercise objects
  warmup          jsonb default '[]',
  cooldown        jsonb default '[]',
  coaching_note   text,
  completed       boolean default false,
  created_at      timestamptz default now()
);

create index on public.workout_sessions (user_id, date desc);

-- ── MEAL LOGS ───────────────────────────────────────────────
create table public.meal_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  meal_type       text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  date            date not null default current_date,
  calories        int not null default 0,
  protein         numeric(6,1) default 0,
  carbs           numeric(6,1) default 0,
  fats            numeric(6,1) default 0,
  ingredients     jsonb default '[]',
  quick_recipe    text,
  healthier_swap  text,
  eaten           boolean default false,
  created_at      timestamptz default now()
);

create index on public.meal_logs (user_id, date desc);

-- ── DAILY STATS ─────────────────────────────────────────────
create table public.daily_stats (
  user_id            uuid references auth.users(id) on delete cascade not null,
  date               date not null default current_date,
  calories_burned    int default 0,
  workouts_completed int default 0,
  water_intake       numeric(4,2) default 0,
  calories_consumed  int default 0,
  primary key (user_id, date)
);

-- ── GOALS ───────────────────────────────────────────────────
create table public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  type       text not null,
  target     numeric not null,
  current    numeric default 0,
  unit       text not null,
  deadline   date,
  completed  boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.goals (user_id);

-- ── GAMIFICATION ────────────────────────────────────────────
create table public.gamification (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  points          int default 0,
  level           int default 1,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_active     date,
  earned_badges   jsonb default '[]',  -- array of { id: string, earnedAt: string (ISO date) }
  updated_at      timestamptz default now()
);

-- ── PROGRESS PHOTOS ─────────────────────────────────────────
-- Actual files live in Supabase Storage bucket 'progress-photos'
-- This table holds metadata only
create table public.progress_photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,    -- e.g. "<user_id>/front_2025-05-15.jpg"
  angle        text check (angle in ('front', 'side', 'back')),
  notes        text,
  taken_at     date not null default current_date,
  created_at   timestamptz default now()
);

create index on public.progress_photos (user_id, taken_at desc);

-- ── AI CONVERSATIONS ────────────────────────────────────────
create table public.ai_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  session_id text not null,     -- groups messages per chat window opening
  role       text check (role in ('user', 'assistant')) not null,
  content    text not null,
  created_at timestamptz default now()
);

create index on public.ai_conversations (user_id, session_id, created_at);

-- ── AI USAGE TRACKING ───────────────────────────────────────
create table public.ai_usage (
  user_id uuid references auth.users(id) on delete cascade not null,
  date    date not null default current_date,
  feature text not null,   -- 'workout' | 'meal' | 'chat' | 'analysis'
  count   int not null default 0,
  primary key (user_id, date, feature)
);

-- ── STORAGE BUCKET ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,                  -- private bucket, requires auth
  5242880,                -- 5MB per photo
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.meal_logs         enable row level security;
alter table public.daily_stats       enable row level security;
alter table public.goals             enable row level security;
alter table public.gamification      enable row level security;
alter table public.progress_photos   enable row level security;
alter table public.ai_conversations  enable row level security;
alter table public.ai_usage          enable row level security;

-- profiles
create policy "select own profile"  on public.profiles for select  using (auth.uid() = id);
create policy "insert own profile"  on public.profiles for insert  with check (auth.uid() = id);
create policy "update own profile"  on public.profiles for update  using (auth.uid() = id);

-- workout_sessions
create policy "own workouts" on public.workout_sessions for all using (auth.uid() = user_id);

-- meal_logs
create policy "own meals" on public.meal_logs for all using (auth.uid() = user_id);

-- daily_stats
create policy "own stats" on public.daily_stats for all using (auth.uid() = user_id);

-- goals
create policy "own goals" on public.goals for all using (auth.uid() = user_id);

-- gamification
create policy "own gamification" on public.gamification for all using (auth.uid() = user_id);

-- progress_photos
create policy "own photo metadata" on public.progress_photos for all using (auth.uid() = user_id);

-- ai_conversations
create policy "own conversations" on public.ai_conversations for all using (auth.uid() = user_id);

-- ai_usage
create policy "own usage" on public.ai_usage for all using (auth.uid() = user_id);

-- Storage RLS — photos filed under <user_id>/filename
create policy "upload own photos" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "read own photos" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete own photos" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── TRIGGER: auto-create profile + gamification on signup ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );

  insert into public.gamification (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── HELPER: atomic AI usage increment ───────────────────────
-- Called from Edge Functions to safely increment usage count
create or replace function public.increment_ai_usage(
  p_user_id uuid,
  p_feature text
)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  insert into public.ai_usage (user_id, date, feature, count)
  values (p_user_id, current_date, p_feature, 1)
  on conflict (user_id, date, feature)
  do update set count = ai_usage.count + 1
  returning count into new_count;

  return new_count;
end;
$$;

-- ── updated_at triggers ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at  before update on public.profiles  for each row execute procedure public.set_updated_at();
create trigger goals_updated_at     before update on public.goals      for each row execute procedure public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════
-- Phase 3: Nigerian Content Database
-- ═══════════════════════════════════════════════════════════════════

-- Nigerian Foods table (source of truth for all food data)
CREATE TABLE IF NOT EXISTS public.nigerian_foods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  local_name      TEXT,
  category        TEXT NOT NULL CHECK (category IN ('meal','snack','beverage','packaged')),
  origin          TEXT NOT NULL DEFAULT 'nigerian',
  calories        INTEGER NOT NULL,
  protein_g       NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_g         NUMERIC(6,2) NOT NULL DEFAULT 0,
  fats_g          NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_g         NUMERIC(6,2) DEFAULT 0,
  sugar_g         NUMERIC(6,2) DEFAULT 0,
  sodium_mg       INTEGER DEFAULT 0,
  saturated_fat_g NUMERIC(6,2) DEFAULT 0,
  serving_size    TEXT NOT NULL DEFAULT '1 serving',
  serving_grams   INTEGER,
  ingredients     TEXT[] DEFAULT '{}',
  allergens       TEXT[] DEFAULT '{}',
  health_flags    TEXT[] DEFAULT '{}',
  region          TEXT DEFAULT 'nationwide',
  is_verified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nigerian_foods_name_idx ON public.nigerian_foods USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS nigerian_foods_category_idx ON public.nigerian_foods (category);

ALTER TABLE public.nigerian_foods ENABLE ROW LEVEL SECURITY;
-- Public read — no auth needed to search the food database
CREATE POLICY "nigerian_foods_public_read" ON public.nigerian_foods
  FOR SELECT USING (true);


-- Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  address             TEXT,
  city                TEXT,
  state               TEXT,
  lat                 NUMERIC(10,7),
  lng                 NUMERIC(10,7),
  cuisine_types       TEXT[] DEFAULT '{}',
  rating              NUMERIC(3,2) DEFAULT 0,
  review_count        INTEGER DEFAULT 0,
  delivery_fee_naira  INTEGER DEFAULT 0,
  min_order_naira     INTEGER DEFAULT 0,
  is_open             BOOLEAN DEFAULT true,
  is_verified         BOOLEAN DEFAULT false,
  phone               TEXT,
  image_url           TEXT,
  opening_hours       JSONB,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public_read"   ON public.vendors FOR SELECT USING (is_verified = true OR auth.uid() = user_id);
CREATE POLICY "vendors_owner_all"     ON public.vendors FOR ALL    USING (auth.uid() = user_id);


-- Public Trainers table (populated when a trainer completes their profile)
CREATE TABLE IF NOT EXISTS public.public_trainers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  bio                     TEXT,
  specializations         TEXT[] DEFAULT '{}',
  certifications          TEXT[] DEFAULT '{}',
  price_per_session_naira INTEGER,
  city                    TEXT,
  state                   TEXT,
  lat                     NUMERIC(10,7),
  lng                     NUMERIC(10,7),
  rating                  NUMERIC(3,2) DEFAULT 0,
  review_count            INTEGER DEFAULT 0,
  is_available            BOOLEAN DEFAULT true,
  years_experience        INTEGER,
  image_url               TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.public_trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trainers_public_read" ON public.public_trainers FOR SELECT USING (true);
CREATE POLICY "trainers_owner_all"   ON public.public_trainers FOR ALL    USING (auth.uid() = user_id);


-- Gyms table
CREATE TABLE IF NOT EXISTS public.gyms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  address          TEXT NOT NULL,
  city             TEXT,
  state            TEXT,
  lat              NUMERIC(10,7),
  lng              NUMERIC(10,7),
  facilities       TEXT[] DEFAULT '{}',
  membership_plans JSONB,
  rating           NUMERIC(3,2) DEFAULT 0,
  review_count     INTEGER DEFAULT 0,
  phone            TEXT,
  image_url        TEXT,
  is_verified      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gyms_public_read" ON public.gyms FOR SELECT USING (true);
CREATE POLICY "gyms_owner_all"   ON public.gyms FOR ALL    USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────
-- Seed: 30 verified Nigerian foods with accurate nutrition data
-- ─────────────────────────────────────────────────────
INSERT INTO public.nigerian_foods
  (name, local_name, category, calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
   sodium_mg, saturated_fat_g, serving_size, ingredients, allergens, health_flags, is_verified)
VALUES
  ('Jollof Rice','Jollof','meal',350,8,55,12,3,4,680,3,'1 cup (250g)',
   ARRAY['rice','tomatoes','onions','pepper','vegetable oil','stock cubes','thyme'],
   ARRAY[]::TEXT[],ARRAY['moderate-sodium','refined-carbs'],true),

  ('Egusi Soup','Ofe Egusi','meal',420,22,12,35,5,3,750,8,'1 bowl (300ml)',
   ARRAY['melon seeds','palm oil','leafy vegetables','stockfish','crayfish','ogiri','meat'],
   ARRAY['fish','shellfish'],ARRAY['high-fat','high-protein'],true),

  ('Efo Riro','Efo Riro','meal',380,18,8,32,6,2,620,10,'1 bowl (300ml)',
   ARRAY['spinach','palm oil','locust beans','crayfish','assorted meat','stockfish','peppers'],
   ARRAY['fish','shellfish'],ARRAY['high-fat','iron-rich','vitamin-rich'],true),

  ('Amala','Àmàlà','meal',280,3,68,1,4,2,15,0,'1 wrap (200g)',
   ARRAY['yam flour','water'],ARRAY[]::TEXT[],ARRAY['high-carb','low-fat','gluten-free'],true),

  ('Fufu','Fufu','meal',330,2,80,1,3,1,10,0,'1 wrap (200g)',
   ARRAY['cassava','water'],ARRAY[]::TEXT[],ARRAY['high-carb','low-protein'],true),

  ('Moi Moi','Moin Moin','meal',180,12,22,6,5,2,320,1,'1 piece (150g)',
   ARRAY['black-eyed peas','peppers','onions','palm oil','eggs','crayfish'],
   ARRAY['eggs','shellfish'],ARRAY['high-protein','high-fiber'],true),

  ('Akara','Àkàrà','snack',220,10,18,14,4,2,280,2,'3 pieces (120g)',
   ARRAY['black-eyed peas','onions','peppers','vegetable oil'],
   ARRAY[]::TEXT[],ARRAY['fried','moderate-fat'],true),

  ('Suya','Suya','snack',320,28,8,20,2,3,890,6,'6 sticks (200g)',
   ARRAY['beef','suya spice','groundnut powder','ginger','onions'],
   ARRAY['peanuts'],ARRAY['high-protein','high-sodium','contains-peanuts'],true),

  ('Pounded Yam','Iyan','meal',310,4,72,1,4,1,20,0,'1 wrap (200g)',
   ARRAY['yam','water'],ARRAY[]::TEXT[],ARRAY['high-carb','low-fat','gluten-free'],true),

  ('Nigerian Fried Rice','Fried Rice','meal',380,10,52,15,4,5,720,4,'1 cup (250g)',
   ARRAY['rice','mixed vegetables','liver','shrimps','vegetable oil','curry','thyme'],
   ARRAY['shellfish'],ARRAY['moderate-sodium','contains-shellfish'],true),

  ('Ogbono Soup','Ofe Ogbono','meal',360,18,10,28,4,2,680,12,'1 bowl (300ml)',
   ARRAY['ogbono seeds','palm oil','stockfish','meat','crayfish','vegetables'],
   ARRAY['fish','shellfish'],ARRAY['high-fat','high-protein'],true),

  ('Pepper Soup','Ofe Nsala','meal',250,25,8,14,2,2,580,4,'1 bowl (350ml)',
   ARRAY['meat','fish','pepper soup spice','onions','utazi leaves','scent leaves'],
   ARRAY['fish'],ARRAY['high-protein','spicy','low-carb'],true),

  ('Ewa Agoyin','Ẹ̀wà Àgọ̀yìn','meal',340,14,42,14,8,3,450,5,'1 plate (300g)',
   ARRAY['honey beans','palm oil','onions','peppers','crayfish'],
   ARRAY['shellfish'],ARRAY['high-fiber','high-protein'],true),

  ('Puff Puff','Puff Puff','snack',280,4,38,12,1,15,180,2,'5 pieces (100g)',
   ARRAY['flour','sugar','yeast','nutmeg','vegetable oil'],
   ARRAY['gluten'],ARRAY['high-sugar','fried','refined-carbs'],true),

  ('Zobo Drink','Zobo','beverage',45,0,12,0,0,8,10,0,'1 glass (250ml)',
   ARRAY['hibiscus leaves','ginger','pineapple','cloves'],
   ARRAY[]::TEXT[],ARRAY['antioxidant-rich'],true),

  ('Chin Chin','Chin Chin','snack',450,6,52,24,2,18,220,6,'1 cup (80g)',
   ARRAY['flour','sugar','butter','eggs','milk','nutmeg'],
   ARRAY['gluten','eggs','dairy'],ARRAY['high-sugar','high-fat','fried'],true),

  ('Kunu','Kunu Zaki','beverage',120,3,26,1,2,12,15,0,'1 glass (250ml)',
   ARRAY['millet','ginger','cloves','sweet potatoes'],
   ARRAY[]::TEXT[],ARRAY['probiotic','moderate-sugar'],true),

  ('Banga Soup','Ofe Akwu','meal',450,20,15,38,5,3,720,15,'1 bowl (300ml)',
   ARRAY['palm fruit','beef','fish','crayfish','beletete','oburunbebe stick'],
   ARRAY['fish','shellfish'],ARRAY['high-fat','high-saturated-fat'],true),

  ('Okra Soup','Ofe Okwuru','meal',220,16,12,14,6,3,520,4,'1 bowl (300ml)',
   ARRAY['okra','palm oil','meat','fish','crayfish','ogiri'],
   ARRAY['fish','shellfish'],ARRAY['high-fiber','low-calorie'],true),

  ('Fried Plantain','Dodo','snack',250,2,45,8,3,18,5,1,'1 plantain (150g)',
   ARRAY['ripe plantain','vegetable oil'],
   ARRAY[]::TEXT[],ARRAY['fried','natural-sugars'],true),

  ('Garri (Eba)','Eba','meal',360,1,88,1,2,1,5,0,'1 wrap (200g)',
   ARRAY['cassava granules','hot water'],
   ARRAY[]::TEXT[],ARRAY['high-carb','low-nutrient-density'],true),

  ('Beans Porridge','Ewa Riro','meal',320,16,48,6,8,4,380,1,'1 plate (300g)',
   ARRAY['black-eyed peas','palm oil','onions','peppers','crayfish'],
   ARRAY['shellfish'],ARRAY['high-fiber','high-protein'],true),

  ('Vegetable Soup','Ofe Onugbu','meal',290,20,10,22,8,2,640,7,'1 bowl (300ml)',
   ARRAY['bitter leaf','palm oil','stockfish','crayfish','assorted meat','cocoyam'],
   ARRAY['fish','shellfish'],ARRAY['iron-rich','vitamin-rich'],true),

  ('Chicken Suya','Suya Adiyẹ','snack',280,30,6,16,1,2,750,4,'6 pieces (200g)',
   ARRAY['chicken','suya spice','groundnut powder','ginger'],
   ARRAY['peanuts'],ARRAY['high-protein','high-sodium'],true),

  ('Ofada Rice with Sauce','Ofada','meal',420,12,65,16,4,5,580,5,'1 plate (350g)',
   ARRAY['ofada rice','locust beans','assorted meat','palm oil','peppers','crayfish'],
   ARRAY['shellfish'],ARRAY['unrefined-carbs','high-protein'],true),

  ('Oha Soup','Ofe Ora','meal',310,19,9,24,6,2,590,8,'1 bowl (300ml)',
   ARRAY['oha leaves','cocoyam','palm oil','stockfish','crayfish','assorted meat'],
   ARRAY['fish','shellfish'],ARRAY['iron-rich','high-protein'],true),

  ('Pepper Chicken','Fried Chicken','meal',380,32,12,24,2,4,820,7,'2 pieces (250g)',
   ARRAY['chicken','peppers','onions','thyme','curry','vegetable oil'],
   ARRAY[]::TEXT[],ARRAY['high-protein','high-sodium'],true),

  ('Groundnut Soup','Ofe Ose Oji','meal',480,22,18,38,6,4,650,8,'1 bowl (300ml)',
   ARRAY['groundnut paste','palm oil','meat','fish','crayfish','stockfish','peppers'],
   ARRAY['peanuts','fish','shellfish'],ARRAY['high-fat','high-protein','contains-peanuts'],true),

  ('Catfish Pepper Soup','Obe Ata Eja','meal',200,28,6,8,2,2,520,2,'1 bowl (350ml)',
   ARRAY['catfish','pepper soup spice','utazi','crayfish','onions'],
   ARRAY['fish'],ARRAY['high-protein','low-carb','spicy'],true),

  ('Boiled Plantain','Ogede Omi','snack',180,2,42,0,3,12,3,0,'1 medium (150g)',
   ARRAY['plantain','water'],
   ARRAY[]::TEXT[],ARRAY['low-fat','natural-sugars','gluten-free'],true)

ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- Phase 4: Payments & Marketplace
-- ═══════════════════════════════════════════════════════════════════

-- Subscriptions — one active row per user at any time
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan                       TEXT NOT NULL CHECK (plan IN ('free','pro','elite')),
  status                     TEXT NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','pending','cancelled','expired')),
  paystack_subscription_code TEXT,
  paystack_customer_code     TEXT,
  paystack_reference         TEXT,
  amount_naira               INTEGER,
  starts_at                  TIMESTAMPTZ DEFAULT now(),
  ends_at                    TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx
  ON public.subscriptions (user_id, status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- Users can read their own subscriptions; service_role does all writes
CREATE POLICY "subscriptions_user_read"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_service_write"
  ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');


-- Orders (vendor marketplace — food delivery)
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id          UUID REFERENCES public.vendors(id) NOT NULL,
  items              JSONB NOT NULL DEFAULT '[]',
  subtotal_naira     INTEGER NOT NULL,
  delivery_fee_naira INTEGER DEFAULT 0,
  total_naira        INTEGER NOT NULL,
  status             TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  delivery_address   TEXT,
  paystack_reference TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_user_read"    ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_user_insert"  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_vendor_read"  ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);
CREATE POLICY "orders_vendor_update" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
);


-- Trainer bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trainer_id         UUID REFERENCES public.public_trainers(id) NOT NULL,
  session_type       TEXT DEFAULT 'online' CHECK (session_type IN ('online','in-person')),
  scheduled_at       TIMESTAMPTZ NOT NULL,
  duration_minutes   INTEGER DEFAULT 60,
  amount_naira       INTEGER,
  status             TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','completed','cancelled')),
  paystack_reference TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_user_read"    ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_user_insert"  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_trainer_read" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.public_trainers t WHERE t.id = trainer_id AND t.user_id = auth.uid())
);
CREATE POLICY "bookings_trainer_update" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.public_trainers t WHERE t.id = trainer_id AND t.user_id = auth.uid())
);


-- ─────────────────────────────────────────────────────
-- Helpers used by paystack-webhook Edge Function
-- ─────────────────────────────────────────────────────

-- Upserts an active subscription and syncs plan to profiles
CREATE OR REPLACE FUNCTION public.upsert_subscription(
  p_user_id                  UUID,
  p_plan                     TEXT,
  p_paystack_reference       TEXT,
  p_paystack_customer_code   TEXT DEFAULT NULL,
  p_paystack_subscription_code TEXT DEFAULT NULL,
  p_amount_naira             INTEGER DEFAULT NULL,
  p_ends_at                  TIMESTAMPTZ DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Cancel any previous active subscription for this user
  UPDATE public.subscriptions
     SET status = 'cancelled', updated_at = now()
   WHERE user_id = p_user_id AND status = 'active';

  -- Insert the new active subscription
  INSERT INTO public.subscriptions
    (user_id, plan, status, paystack_reference, paystack_customer_code,
     paystack_subscription_code, amount_naira, starts_at, ends_at)
  VALUES
    (p_user_id, p_plan, 'active', p_paystack_reference, p_paystack_customer_code,
     p_paystack_subscription_code, p_amount_naira, now(), p_ends_at);

  -- Sync plan field on the profiles table so Edge Functions see it immediately
  UPDATE public.profiles SET plan = p_plan WHERE id = p_user_id;
END;
$$;

-- Cancels the active subscription for a user (called from webhook on disable event)
CREATE OR REPLACE FUNCTION public.cancel_subscription(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.subscriptions
     SET status = 'cancelled', updated_at = now()
   WHERE user_id = p_user_id AND status = 'active';

  UPDATE public.profiles SET plan = 'free' WHERE id = p_user_id;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════
-- Phase 5: Live Streaming
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trainer_name     TEXT NOT NULL,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'HIIT',
  description      TEXT,
  agora_channel    TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','ended')),
  viewer_count     INTEGER DEFAULT 0,
  viewer_peak      INTEGER DEFAULT 0,
  thumbnail_gradient TEXT DEFAULT 'from-primary/50 to-secondary/50',
  started_at       TIMESTAMPTZ DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_sessions_status_idx ON public.live_sessions (status);
CREATE INDEX IF NOT EXISTS live_sessions_trainer_idx ON public.live_sessions (trainer_id);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Trainers can manage their own sessions
CREATE POLICY "live_sessions_trainer_all" ON public.live_sessions
  FOR ALL USING (auth.uid() = trainer_id);

-- Pro/Elite subscribers can read live sessions (and trainers/admins)
CREATE POLICY "live_sessions_premium_read" ON public.live_sessions
  FOR SELECT USING (
    status = 'live' AND (
      auth.uid() = trainer_id
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.status = 'active'
          AND s.plan IN ('pro','elite')
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('trainer','gym_owner','admin')
      )
    )
  );

-- Helper: increment viewer count atomically
CREATE OR REPLACE FUNCTION public.update_live_viewer_count(
  p_session_id UUID,
  p_delta      INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.live_sessions
     SET viewer_count = GREATEST(0, viewer_count + p_delta),
         viewer_peak  = GREATEST(viewer_peak, GREATEST(0, viewer_count + p_delta))
   WHERE id = p_session_id AND status = 'live';
END;
$$;


-- ── Live chat ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.live_chat (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username    TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_trainer  BOOLEAN DEFAULT false,
  sent_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_chat_session_idx ON public.live_chat (session_id, sent_at);

-- Enable Realtime for live chat
ALTER TABLE public.live_chat REPLICA IDENTITY FULL;

ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_chat_premium_read" ON public.live_chat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND s.plan IN ('pro','elite')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('trainer','gym_owner','admin')
    )
  );

CREATE POLICY "live_chat_insert" ON public.live_chat
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- Phase 6: Community & Social
-- ═══════════════════════════════════════════════════════════════════

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
-- (Final corrected version — gamification.current_streak aliased as streak)

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


-- ═══════════════════════════════════════════════════════════════════
-- Phase 7: Push Notifications
-- ═══════════════════════════════════════════════════════════════════

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notification log (for deduplication)
create table if not exists notification_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  payload     jsonb,
  sent_at     timestamptz default now()
);

create index on notification_log (user_id, type, sent_at);

-- Function: clean old notification logs (keep 30 days)
create or replace function cleanup_notification_log() returns void language sql security definer as $$
  delete from notification_log where sent_at < now() - interval '30 days';
$$;


-- ═══════════════════════════════════════════════════════════════════
-- Done. Next step: create seed users (one per role) via the Admin API:
--   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-users.mjs
-- Password for all seed accounts: OneFitness
-- ═══════════════════════════════════════════════════════════════════
