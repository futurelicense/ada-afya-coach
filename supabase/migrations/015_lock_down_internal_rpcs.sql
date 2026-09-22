-- ─────────────────────────────────────────────────────
-- Security fix: upsert_subscription, cancel_subscription and
-- fulfill_marketplace_payment are SECURITY DEFINER functions meant to be
-- called only from the paystack-webhook / paystack-verify Edge Functions
-- (which use the service-role key). Postgres grants EXECUTE to PUBLIC by
-- default on CREATE FUNCTION, so without an explicit REVOKE any signed-in
-- (or anonymous) client could call these directly via supabase.rpc() to
-- grant themselves a free subscription, cancel another user's plan, or
-- fake-confirm an unpaid order/booking/membership.
-- ─────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.upsert_subscription(
  uuid, text, text, text, text, integer, timestamptz
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.cancel_subscription(uuid) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.fulfill_marketplace_payment(text, text, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.upsert_subscription(
  uuid, text, text, text, text, integer, timestamptz
) TO service_role;

GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid) TO service_role;

GRANT EXECUTE ON FUNCTION public.fulfill_marketplace_payment(text, text, uuid) TO service_role;

-- ─────────────────────────────────────────────────────
-- Correctness fix: fulfill_marketplace_payment had no status guard, so
-- calling it twice for the same reference (e.g. both the webhook and the
-- client's own paystack-verify call fire for one payment) re-applied the
-- effect: stock got decremented twice and gym membership windows got
-- reset to "now()" a second time. Excluding rows already in their
-- terminal state makes each branch a no-op on replay.
-- ─────────────────────────────────────────────────────
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
  v_items  jsonb;
begin
  if p_kind = 'meal_order' then
    update public.orders
       set status = 'confirmed', updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id
       and status <> 'confirmed'
     returning items into v_items;

    update public.vendor_menu_items mi
       set quantity = greatest(0, mi.quantity - coalesce((elem->>'qty')::int, 1))
      from jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) elem
     where mi.id = nullif(elem->>'menu_item_id', '')::uuid
       and mi.quantity is not null;

    v_result := jsonb_build_object('kind', 'meal_order');

  elsif p_kind = 'trainer_booking' then
    update public.bookings
       set status = 'confirmed', updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id
       and status <> 'confirmed';
    v_result := jsonb_build_object('kind', 'trainer_booking');

  elsif p_kind = 'gym_membership' then
    update public.gym_memberships
       set status = 'active',
           starts_at = now(),
           ends_at = now() + (months || ' months')::interval,
           updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id
       and status <> 'active';
    v_result := jsonb_build_object('kind', 'gym_membership');

  elsif p_kind = 'partnership' then
    update public.influencer_partnerships
       set status = 'paid', updated_at = now()
     where paystack_reference = p_reference and brand_user_id = p_user_id
       and status <> 'paid';
    v_result := jsonb_build_object('kind', 'partnership');
  else
    raise exception 'Unknown marketplace kind %', p_kind;
  end if;

  return v_result;
end;
$$;

grant execute on function public.fulfill_marketplace_payment(text, text, uuid) to service_role;
