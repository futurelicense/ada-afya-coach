-- ─────────────────────────────────────────────────────
-- Phase 3: Nigerian Content Database
-- ─────────────────────────────────────────────────────

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
