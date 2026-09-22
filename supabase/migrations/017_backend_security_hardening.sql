-- Backend security hardening:
--   * make AI quota consumption atomic and service-owned
--   * prevent clients from mutating paid marketplace records
--   * make marketplace fulfillment fail loudly when no record is matched

-- Profiles are user-editable, so prevent a client from granting itself a paid
-- plan. Only service-role payment functions may change it.
create or replace function public.protect_profile_plan()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.plan is distinct from old.plan
     and auth.role() <> 'service_role' then
    raise exception using
      errcode = '42501',
      message = 'plan is managed by the payment service';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_plan on public.profiles;
create trigger trg_protect_profile_plan
before update of plan on public.profiles
for each row execute function public.protect_profile_plan();

-- Usage remains readable by its owner, but only server code can write it.
drop policy if exists "own usage" on public.ai_usage;
drop policy if exists "ai_usage_own_read" on public.ai_usage;
create policy "ai_usage_own_read"
  on public.ai_usage for select
  using (auth.uid() = user_id);

revoke insert, update, delete on public.ai_usage from anon, authenticated;

-- The former increment-only RPC had no quota check and was executable through
-- PUBLIC by default. Keep it unavailable even if older Edge code still names it.
revoke execute on function public.increment_ai_usage(uuid, text) from public, anon, authenticated;
grant execute on function public.increment_ai_usage(uuid, text) to service_role;

-- Atomically check and consume one request. The plan is resolved from active,
-- unexpired subscriptions rather than accepted from the caller.
create or replace function public.consume_ai_usage(
  p_user_id uuid,
  p_feature text
)
returns table (usage_count int, usage_limit int, plan text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text := 'free';
  v_limit int := 5;
  v_count int;
begin
  if auth.role() <> 'service_role' then
    raise exception using errcode = '42501', message = 'service role required';
  end if;

  if p_user_id is null or nullif(btrim(p_feature), '') is null then
    raise exception using errcode = '22023', message = 'user and feature are required';
  end if;

  select s.plan
    into v_plan
    from public.subscriptions s
   where s.user_id = p_user_id
     and s.status = 'active'
     and (s.ends_at is null or s.ends_at > now())
   order by case s.plan when 'elite' then 2 when 'pro' then 1 else 0 end desc,
            s.created_at desc
   limit 1;

  v_plan := coalesce(v_plan, 'free');
  v_limit := case v_plan when 'elite' then null when 'pro' then 50 else 5 end;

  insert into public.ai_usage (user_id, date, feature, count)
  values (p_user_id, current_date, p_feature, 1)
  on conflict (user_id, date, feature) do update
     set count = public.ai_usage.count + 1
   where v_limit is null or public.ai_usage.count < v_limit
  returning count into v_count;

  if v_count is null then
    raise exception using
      errcode = 'P0001',
      message = 'AI_QUOTA_EXCEEDED',
      detail = format('Daily %s limit reached for %s plan', v_limit, v_plan);
  end if;

  return query select v_count, v_limit, v_plan;
end;
$$;

revoke execute on function public.consume_ai_usage(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_ai_usage(uuid, text) to service_role;

-- Paid records must be created and changed through trusted Edge Functions.
-- Existing customer/business/admin SELECT policies are intentionally retained.
drop policy if exists "orders_user_insert" on public.orders;
drop policy if exists "orders_vendor_update" on public.orders;
drop policy if exists "bookings_user_insert" on public.bookings;
drop policy if exists "bookings_trainer_update" on public.bookings;
drop policy if exists "memberships_user_insert" on public.gym_memberships;
drop policy if exists "memberships_owner_update" on public.gym_memberships;
drop policy if exists "partnerships_brand" on public.influencer_partnerships;
drop policy if exists "partnerships_influencer_upd" on public.influencer_partnerships;

-- Re-add the partnership read access that was previously bundled into its
-- brand FOR ALL policy.
drop policy if exists "partnerships_brand_read" on public.influencer_partnerships;
create policy "partnerships_brand_read"
  on public.influencer_partnerships for select
  using (auth.uid() = brand_user_id);

revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.bookings from anon, authenticated;
revoke insert, update, delete on public.gym_memberships from anon, authenticated;
revoke insert, update, delete on public.influencer_partnerships from anon, authenticated;
grant insert, update, delete on public.orders to service_role;
grant insert, update, delete on public.bookings to service_role;
grant insert, update, delete on public.gym_memberships to service_role;
grant insert, update, delete on public.influencer_partnerships to service_role;

-- Fulfillment is idempotent, service-only, and treats a missing reference as an
-- error so webhook delivery is retried instead of falsely acknowledged.
create or replace function public.fulfill_marketplace_payment(
  p_kind text,
  p_reference text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_items jsonb;
  v_found boolean := false;
begin
  if auth.role() <> 'service_role' then
    raise exception using errcode = '42501', message = 'service role required';
  end if;

  if nullif(btrim(p_reference), '') is null or p_user_id is null then
    raise exception using errcode = '22023', message = 'reference and user are required';
  end if;

  if p_kind = 'meal_order' then
    select items into v_items
      from public.orders
     where paystack_reference = p_reference and user_id = p_user_id
     for update;
    v_found := found;

    if v_found and exists (
      select 1 from public.orders
       where paystack_reference = p_reference and user_id = p_user_id
         and status <> 'confirmed'
    ) then
      update public.orders
         set status = 'confirmed', updated_at = now()
       where paystack_reference = p_reference and user_id = p_user_id;

      update public.vendor_menu_items mi
         set quantity = greatest(0, mi.quantity - coalesce((elem->>'qty')::int, 1))
        from jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) elem
       where mi.id = nullif(elem->>'menu_item_id', '')::uuid
         and mi.quantity is not null;
    end if;
    v_result := jsonb_build_object('kind', 'meal_order');

  elsif p_kind = 'trainer_booking' then
    update public.bookings
       set status = case when status = 'confirmed' then status else 'confirmed' end,
           updated_at = case when status = 'confirmed' then updated_at else now() end
     where paystack_reference = p_reference and user_id = p_user_id;
    v_found := found;
    v_result := jsonb_build_object('kind', 'trainer_booking');

  elsif p_kind = 'gym_membership' then
    update public.gym_memberships
       set status = case when status = 'active' then status else 'active' end,
           starts_at = case when status = 'active' then starts_at else now() end,
           ends_at = case when status = 'active' then ends_at else now() + (months || ' months')::interval end,
           updated_at = case when status = 'active' then updated_at else now() end
     where paystack_reference = p_reference and user_id = p_user_id;
    v_found := found;
    v_result := jsonb_build_object('kind', 'gym_membership');

  elsif p_kind = 'partnership' then
    update public.influencer_partnerships
       set status = case when status = 'paid' then status else 'paid' end,
           updated_at = case when status = 'paid' then updated_at else now() end
     where paystack_reference = p_reference and brand_user_id = p_user_id;
    v_found := found;
    v_result := jsonb_build_object('kind', 'partnership');
  else
    raise exception using errcode = '22023', message = format('Unknown marketplace kind %s', p_kind);
  end if;

  if not v_found then
    raise exception using
      errcode = 'P0002',
      message = format('No %s record matches payment reference', p_kind);
  end if;

  return v_result;
end;
$$;

revoke execute on function public.fulfill_marketplace_payment(text, text, uuid) from public, anon, authenticated;
grant execute on function public.fulfill_marketplace_payment(text, text, uuid) to service_role;
