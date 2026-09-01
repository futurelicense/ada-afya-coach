/**
 * WeFit — Demo content seed
 *
 * Populates the role-feature tables so a live test has something to click:
 *   - vendor menu categories + items (with stock)
 *   - trainer weekly availability
 *   - gym membership plans
 *   - influencer posts + a few followers
 *   - a couple of paid orders / bookings
 *
 * Run AFTER scripts/seed-users.mjs and migrations 012 + 013.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-demo.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://njwbvbbsbowtfevsocnn.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("❌  Missing SUPABASE_SERVICE_ROLE_KEY.  SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-demo.mjs");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function userId(email) {
  const { data } = await db.auth.admin.listUsers({ perPage: 200 });
  const u = data.users.find((x) => x.email === email);
  if (!u) throw new Error(`Seed user ${email} not found — run seed-users.mjs first`);
  return u.id;
}

const NEW_LISTING = {
  vendors:         (n) => ({ name: `${n}'s Kitchen`, city: "Lagos", address: "Lagos", published: true, delivery_fee_naira: 500, min_order_naira: 1500 }),
  public_trainers: (n) => ({ name: n, city: "Lagos", price_per_session_naira: 5000, published: true, kind: "trainer" }),
  gyms:            (n) => ({ name: `${n} Gym`, address: "Lagos", city: "Lagos", published: true, capacity: 100 }),
  influencers:     (n) => ({ name: n, niche: "Fitness", published: true }),
};

async function listing(table, uid) {
  const { data } = await db.from(table).select("id").eq("user_id", uid).maybeSingle();
  if (data) return data.id;
  const { data: prof } = await db.from("profiles").select("name").eq("id", uid).maybeSingle();
  const { data: created, error } = await db.from(table)
    .insert({ user_id: uid, ...NEW_LISTING[table](prof?.name ?? "WeFit") })
    .select("id").single();
  if (error) throw error;
  console.log(`  (created missing ${table} listing)`);
  return created.id;
}

async function main() {
  const memberId = await userId("user@wefit.ng");
  const vendorU = await userId("vendor@wefit.ng");
  const trainerU = await userId("trainer@wefit.ng");
  const gymU = await userId("gymowner@wefit.ng");
  const infU = await userId("influencer@wefit.ng");

  const vendorId = await listing("vendors", vendorU);
  const trainerId = await listing("public_trainers", trainerU);
  const gymId = await listing("gyms", gymU);
  const infId = await listing("influencers", infU);

  /* ---- Vendor: categories + menu ---- */
  await db.from("vendor_menu_categories").delete().eq("vendor_id", vendorId);
  const catRows = [
    { vendor_id: vendorId, name: "Swallow & Soup", sort: 0 },
    { vendor_id: vendorId, name: "Rice", sort: 1 },
    { vendor_id: vendorId, name: "Protein", sort: 2 },
    { vendor_id: vendorId, name: "Drinks", sort: 3 },
  ];
  const { data: cats } = await db.from("vendor_menu_categories").insert(catRows).select("id, name");
  const catId = (n) => cats.find((c) => c.name === n).id;

  await db.from("vendor_menu_items").delete().eq("vendor_id", vendorId);
  await db.from("vendor_menu_items").insert([
    { vendor_id: vendorId, category_id: catId("Swallow & Soup"), name: "Egusi + Pounded Yam", description: "Melon-seed soup, assorted meat", price_naira: 3500, quantity: 20, available: true },
    { vendor_id: vendorId, category_id: catId("Swallow & Soup"), name: "Afang + Eba", description: "Seafood, periwinkle", price_naira: 3800, quantity: 12, available: true },
    { vendor_id: vendorId, category_id: catId("Rice"), name: "Jollof Rice + Chicken", description: "Smoky party jollof, grilled chicken", price_naira: 2800, quantity: 40, available: true },
    { vendor_id: vendorId, category_id: catId("Rice"), name: "Fried Rice + Fish", description: "Tilapia, mixed veg", price_naira: 3000, quantity: 0, available: true },
    { vendor_id: vendorId, category_id: catId("Rice"), name: "Ofada Rice + Ayamase", description: "Locally milled rice, green pepper sauce", price_naira: 3200, quantity: null, available: true },
    { vendor_id: vendorId, category_id: catId("Protein"), name: "Peppered Snail (3)", description: "", price_naira: 4500, quantity: 8, available: true },
    { vendor_id: vendorId, category_id: catId("Protein"), name: "Suya Platter", description: "300g beef, kilishi spice", price_naira: 3500, quantity: 15, available: true },
    { vendor_id: vendorId, category_id: catId("Drinks"), name: "Chapman (50cl)", description: "", price_naira: 1200, quantity: 30, available: true },
    { vendor_id: vendorId, category_id: catId("Drinks"), name: "Zobo (50cl)", description: "Hibiscus, ginger, pineapple", price_naira: 800, quantity: 25, available: true },
  ]);
  console.log("✓ vendor menu");

  /* ---- Trainer: weekly availability ---- */
  await db.from("trainer_availability").delete().eq("trainer_id", trainerId);
  await db.from("trainer_availability").insert([
    { trainer_id: trainerId, weekday: 1, start_min: 6 * 60, end_min: 9 * 60 },
    { trainer_id: trainerId, weekday: 1, start_min: 17 * 60, end_min: 20 * 60 },
    { trainer_id: trainerId, weekday: 3, start_min: 6 * 60, end_min: 9 * 60 },
    { trainer_id: trainerId, weekday: 3, start_min: 17 * 60, end_min: 20 * 60 },
    { trainer_id: trainerId, weekday: 5, start_min: 6 * 60, end_min: 10 * 60 },
    { trainer_id: trainerId, weekday: 6, start_min: 8 * 60, end_min: 12 * 60 },
  ]);
  console.log("✓ trainer availability");

  /* ---- Gym: plans ---- */
  await db.from("gyms").update({
    membership_plans: [
      { id: "monthly", name: "Monthly", amount_naira: 18000, months: 1 },
      { id: "quarterly", name: "Quarterly", amount_naira: 48000, months: 3 },
      { id: "yearly", name: "Annual", amount_naira: 160000, months: 12 },
    ],
    capacity: 120,
  }).eq("id", gymId);
  console.log("✓ gym plans");

  /* ---- Influencer: posts + followers ---- */
  await db.from("influencer_posts").delete().eq("influencer_id", infId);
  await db.from("influencer_posts").insert([
    { influencer_id: infId, title: "3 home moves for a stronger core", body: "No gym, no wahala. Dead bug, bird dog, and a 30s plank hold — 3 rounds every morning before you shower. Consistency beats intensity.", created_at: new Date(Date.now() - 2 * 864e5).toISOString() },
    { influencer_id: infId, title: "What I actually eat in a day", body: "Breakfast: oats + groundnut. Lunch: ofada rice + plenty veg. Dinner: pepper soup + catfish. Snacks: tiger nuts, banana. Nothing fancy.", created_at: new Date(Date.now() - 5 * 864e5).toISOString() },
    { influencer_id: infId, body: "Reminder: you don't need to train fasted, train early, or train hard every day. You need to train *often*. See you Monday. 💪", created_at: new Date(Date.now() - 9 * 864e5).toISOString() },
  ]);
  await db.from("influencer_follows").upsert(
    [{ influencer_id: infId, follower_id: memberId }],
    { onConflict: "influencer_id,follower_id" },
  );
  console.log("✓ influencer content");

  /* ---- A couple of paid transactions for realism ---- */
  await db.from("orders").insert({
    user_id: memberId, vendor_id: vendorId,
    items: [{ menu_item_id: null, name: "Jollof Rice + Chicken", price_naira: 2800, qty: 2 }],
    subtotal_naira: 5600, delivery_fee_naira: 500, total_naira: 6100,
    status: "delivered", delivery_address: "12 Admiralty Way, Lekki", notes: "08012345678",
    paystack_reference: `demo_${Date.now()}`,
  });
  await db.from("bookings").insert({
    user_id: memberId, trainer_id: trainerId,
    session_type: "online", scheduled_at: new Date(Date.now() + 2 * 864e5).toISOString(),
    duration_minutes: 60, amount_naira: 5000, status: "confirmed",
    paystack_reference: `demo_${Date.now() + 1}`,
  });
  console.log("✓ demo order + booking");

  console.log("\nDone. Log in as vendor@wefit.ng / trainer@wefit.ng / gymowner@wefit.ng / influencer@wefit.ng (password OneFitness).");
}

main().catch((e) => { console.error(e); process.exit(1); });
