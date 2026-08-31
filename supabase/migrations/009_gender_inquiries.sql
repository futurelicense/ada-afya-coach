-- Gender on profiles (onboarding already writes this column)
alter table public.profiles
  add column if not exists gender text;

-- Partner / listing requests (gym, trainer, meal) — not live checkout
create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  type          text not null check (type in ('gym_membership', 'trainer_booking', 'meal_order', 'nutritionist_booking', 'event_interest')),
  listing_id    text,
  listing_name  text not null,
  payload       jsonb not null default '{}',
  status        text not null default 'pending' check (status in ('pending', 'contacted', 'closed')),
  created_at    timestamptz default now()
);

create index if not exists inquiries_user_idx on public.inquiries (user_id, created_at desc);

alter table public.inquiries enable row level security;

create policy "own inquiries" on public.inquiries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic challenge join count (client was stuffing an RPC into an UPDATE)
create or replace function public.increment_challenge_participants(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_challenges
  set participant_count = coalesce(participant_count, 0) + 1
  where id = p_challenge_id;
end;
$$;

-- Lock down increment_ai_usage search_path
create or replace function public.increment_ai_usage(
  p_user_id uuid,
  p_feature text
)
returns int
language plpgsql
security definer
set search_path = public
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
