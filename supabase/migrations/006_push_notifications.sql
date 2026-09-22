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
