-- ============================================================
-- WeFit — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run with: supabase db push
-- ============================================================

-- ── PROFILES ────────────────────────────────────────────────
-- Auto-created on signup via trigger (see bottom of file)
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text,
  email            text,
  age              int,
  weight           numeric(5,1),
  target_weight    numeric(5,1),
  height           numeric(5,1),
  fitness_level    text check (fitness_level in ('beginner', 'intermediate', 'advanced')) default 'intermediate',
  goals            text[] default '{}',
  location         text,
  plan             text check (plan in ('free', 'pro', 'elite')) default 'free',
  role             text check (role in ('user', 'vendor', 'trainer', 'gym_owner', 'influencer')) default 'user',
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
  earned_badges   text[] default '{}',
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
