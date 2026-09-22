-- Phase 12: vendor menu categories + item stock, server-priced meal orders

-- ─────────────────────────────────────────────────────
-- Menu categories
-- ─────────────────────────────────────────────────────
create table if not exists public.vendor_menu_categories (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  uuid references public.vendors(id) on delete cascade not null,
  name       text not null,
  sort       int not null default 0,
  created_at timestamptz default now()
);
create index if not exists vendor_menu_cat_idx on public.vendor_menu_categories (vendor_id, sort);
alter table public.vendor_menu_categories enable row level security;
drop policy if exists "menu_cat_public_read" on public.vendor_menu_categories;
create policy "menu_cat_public_read" on public.vendor_menu_categories for select using (true);
drop policy if exists "menu_cat_owner_all" on public.vendor_menu_categories;
create policy "menu_cat_owner_all" on public.vendor_menu_categories for all
  using  (exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()))
  with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()));

drop policy if exists "menu_cat_admin_all" on public.vendor_menu_categories;
create policy "menu_cat_admin_all" on public.vendor_menu_categories for all using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────
-- Menu item: category, stock quantity, image
-- ─────────────────────────────────────────────────────
alter table public.vendor_menu_items
  add column if not exists category_id uuid references public.vendor_menu_categories(id) on delete set null,
  add column if not exists quantity    int,          -- null = unlimited; 0 = sold out
  add column if not exists image_url   text;

-- ─────────────────────────────────────────────────────
-- Decrement stock when a meal order is paid.
-- Order items carry {menu_item_id, name, price_naira, qty}.
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
     where paystack_reference = p_reference and user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'trainer_booking');

  elsif p_kind = 'gym_membership' then
    update public.gym_memberships
       set status = 'active',
           starts_at = now(),
           ends_at = now() + (months || ' months')::interval,
           updated_at = now()
     where paystack_reference = p_reference and user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'gym_membership');

  elsif p_kind = 'partnership' then
    update public.influencer_partnerships
       set status = 'paid', updated_at = now()
     where paystack_reference = p_reference and brand_user_id = p_user_id;
    v_result := jsonb_build_object('kind', 'partnership');
  else
    raise exception 'Unknown marketplace kind %', p_kind;
  end if;

  return v_result;
end;
$$;
grant execute on function public.fulfill_marketplace_payment(text, text, uuid) to service_role;

-- Public menu browsing: return a vendor's live menu grouped-ready (available + in stock)
create or replace function public.vendor_menu(p_vendor uuid)
returns table (
  id uuid, name text, description text, price_naira int, image_url text,
  category_id uuid, category_name text, category_sort int, in_stock boolean
)
language sql stable security definer set search_path = public as $$
  select mi.id, mi.name, mi.description, mi.price_naira, mi.image_url,
         mi.category_id, c.name, coalesce(c.sort, 999),
         (mi.available and (mi.quantity is null or mi.quantity > 0)) as in_stock
    from public.vendor_menu_items mi
    left join public.vendor_menu_categories c on c.id = mi.category_id
   where mi.vendor_id = p_vendor
   order by coalesce(c.sort, 999), c.name nulls last, mi.created_at;
$$;
grant execute on function public.vendor_menu(uuid) to authenticated;
