-- Track each goal's starting value separately from its (ever-changing) current
-- value, so progress percentage can be computed against the original baseline
-- instead of drifting as the user logs updates. Existing rows are backfilled
-- with their current value — the best available approximation for goals that
-- already have progress logged, since no earlier value was recorded.
alter table public.goals add column if not exists start_value numeric;
update public.goals set start_value = current where start_value is null;
