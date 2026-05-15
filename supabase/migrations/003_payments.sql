-- ─────────────────────────────────────────────────────
-- Phase 4: Payments & Marketplace
-- ─────────────────────────────────────────────────────

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
