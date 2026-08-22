/**
 * WeFit — Seed Users Script
 *
 * Creates one test account per role using the Supabase Admin API.
 * Safe to re-run — existing users are updated, not duplicated.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-users.mjs
 *
 * Get your service_role key from:
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://clvrhogimhzxintphjwj.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("❌  Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  console.error("    Run: SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-users.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "OneFitness";

const SEED_USERS = [
  {
    email: "user@wefit.ng",
    profile: {
      name: "Chidi Okonkwo",
      age: 26, weight: 78.5, height: 178,
      fitness_level: "intermediate",
      goals: ["build-muscle", "lose-weight"],
      location: "Lagos", plan: "pro", role: "user",
      diet_preference: "everything", onboarding_done: true,
      join_date: daysAgo(60),
    },
    gamification: {
      points: 4200, level: 8, current_streak: 14,
      longest_streak: 21, last_active: today(),
      earned_badges: ["first_workout", "week_warrior", "calorie_crusher"],
    },
  },
  {
    email: "vendor@wefit.ng",
    profile: {
      name: "Kemi Adeyemi",
      age: 34, weight: 64.0, height: 161,
      fitness_level: "beginner",
      goals: ["stay-fit"],
      location: "Abuja", plan: "free", role: "vendor",
      diet_preference: "vegetarian", onboarding_done: true,
      join_date: daysAgo(45),
    },
    gamification: {
      points: 850, level: 3, current_streak: 3,
      longest_streak: 7, last_active: today(),
      earned_badges: ["first_workout"],
    },
  },
  {
    email: "trainer@wefit.ng",
    profile: {
      name: "Emeka Nwosu",
      age: 29, weight: 86.0, height: 183,
      fitness_level: "advanced",
      goals: ["improve-endurance"],
      location: "Lagos", plan: "elite", role: "trainer",
      diet_preference: "everything", onboarding_done: true,
      join_date: daysAgo(90),
    },
    gamification: {
      points: 9800, level: 15, current_streak: 45,
      longest_streak: 60, last_active: today(),
      earned_badges: ["first_workout", "iron_will", "inferno_week", "early_bird", "hydration_hero"],
    },
  },
  {
    email: "gymowner@wefit.ng",
    profile: {
      name: "Bola Adebisi",
      age: 43, weight: 91.0, height: 181,
      fitness_level: "intermediate",
      goals: ["stay-fit"],
      location: "Ibadan", plan: "pro", role: "gym_owner",
      diet_preference: "everything", onboarding_done: true,
      join_date: daysAgo(120),
    },
    gamification: {
      points: 3100, level: 6, current_streak: 7,
      longest_streak: 14, last_active: today(),
      earned_badges: ["first_workout", "week_warrior"],
    },
  },
  {
    email: "influencer@wefit.ng",
    profile: {
      name: "Tunde Oladele",
      age: 24, weight: 71.0, height: 176,
      fitness_level: "advanced",
      goals: ["build-muscle"],
      location: "Lagos", plan: "elite", role: "influencer",
      diet_preference: "everything", onboarding_done: true,
      join_date: daysAgo(30),
    },
    gamification: {
      points: 6750, level: 11, current_streak: 21,
      longest_streak: 30, last_active: today(),
      earned_badges: ["first_workout", "week_warrior", "iron_will"],
    },
  },
  {
    email: "admin@wefit.ng",
    profile: {
      name: "WeFit Admin",
      age: 30, weight: 75.0, height: 175,
      fitness_level: "advanced",
      goals: ["stay-fit"],
      location: "Nigeria", plan: "elite", role: "admin",
      diet_preference: "everything", onboarding_done: true,
      join_date: daysAgo(365),
    },
    gamification: {
      points: 99999, level: 99, current_streak: 99,
      longest_streak: 99, last_active: today(),
      earned_badges: ["first_workout", "iron_will", "inferno_week", "early_bird", "hydration_hero", "admin"],
    },
  },
];

// ── helpers ──────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ── main ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Seeding WeFit users…\n");

  for (const u of SEED_USERS) {
    process.stdout.write(`  ${u.email.padEnd(26)} `);

    // 1. Create or fetch the auth user
    let userId;
    const { data: existing } = await supabase.auth.admin.listUsers();
    const match = existing?.users?.find(x => x.email === u.email);

    if (match) {
      // Delete the old record — direct SQL inserts leave NULL token fields
      // that cause GoTrue 500s. Recreate cleanly via the admin API.
      await supabase.auth.admin.deleteUser(match.id);
      process.stdout.write("(replacing broken record) ");
    }
    {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
      });
      if (error) {
        console.error(`\n    ❌  createUser failed: ${error.message}`);
        continue;
      }
      userId = data.user.id;
      process.stdout.write("(created) ");
    }

    // 2. Upsert profile
    const { error: pe } = await supabase.from("profiles").upsert(
      { id: userId, email: u.email, ...u.profile },
      { onConflict: "id" }
    );
    if (pe) { console.error(`\n    ❌  profile: ${pe.message}`); continue; }

    // 3. Upsert gamification
    const { error: ge } = await supabase.from("gamification").upsert(
      { user_id: userId, ...u.gamification, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (ge) { console.error(`\n    ❌  gamification: ${ge.message}`); continue; }

    console.log("✓");
  }

  // ── Subscriptions ──────────────────────────────────────────────────
  console.log("\n  Seeding subscriptions…");
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  const byEmail = Object.fromEntries(allUsers.users.map(u => [u.email, u.id]));

  const subs = [
    { email: "user@wefit.ng",       plan: "pro",   code: "SUB_seed_user",       days_ago: 30 },
    { email: "trainer@wefit.ng",    plan: "elite", code: "SUB_seed_trainer",     days_ago: 60 },
    { email: "gymowner@wefit.ng",   plan: "pro",   code: "SUB_seed_gymowner",    days_ago: 90 },
    { email: "influencer@wefit.ng", plan: "elite", code: "SUB_seed_influencer",  days_ago: 20 },
    { email: "admin@wefit.ng",      plan: "elite", code: "SUB_seed_admin",       days_ago: 365 },
  ];

  for (const s of subs) {
    const uid = byEmail[s.email];
    if (!uid) continue;
    const start = new Date(); start.setDate(start.getDate() - s.days_ago);
    const end   = new Date(); end.setDate(end.getDate() + 30);
    await supabase.from("subscriptions").delete().eq("user_id", uid);
    const { error } = await supabase.from("subscriptions").insert({
      user_id: uid, plan: s.plan, status: "active",
      paystack_subscription_code: s.code,
      starts_at: start.toISOString(), ends_at: end.toISOString(),
    });
    if (error) console.error(`    ❌  sub ${s.email}: ${error.message}`);
    else       console.log(`    ✓  ${s.email} → ${s.plan}`);
  }

  // ── Vendor ─────────────────────────────────────────────────────────
  console.log("\n  Seeding vendor…");
  const vendorId = byEmail["vendor@wefit.ng"];
  if (vendorId) {
    await supabase.from("vendors").delete().eq("user_id", vendorId);
    const { error } = await supabase.from("vendors").insert({
      user_id: vendorId,
      name: "Kemi's Healthy Kitchen",
      description: "Delicious Nigerian meals — macro-tracked and freshly prepared daily in Abuja.",
      city: "Abuja", state: "FCT",
      cuisine_types: ["Nigerian Cuisine", "Healthy", "Meal Prep"],
      is_verified: true,
    });
    if (error) console.error(`    ❌  vendor: ${error.message}`);
    else       console.log("    ✓  Kemi's Healthy Kitchen");
  }

  // ── Trainer ────────────────────────────────────────────────────────
  console.log("\n  Seeding trainer…");
  const trainerId = byEmail["trainer@wefit.ng"];
  if (trainerId) {
    await supabase.from("public_trainers").delete().eq("user_id", trainerId);
    const { error } = await supabase.from("public_trainers").insert({
      user_id: trainerId,
      name: "Emeka Nwosu",
      bio: "NSCA-certified strength & conditioning coach with 6 years training Nigerians. Specialises in fat loss, hypertrophy, and functional fitness.",
      specializations: ["Strength Training", "HIIT", "Fat Loss", "Sports Conditioning"],
      city: "Lagos", state: "Lagos",
      certifications: ["NSCA-CSCS", "CPR/AED Certified"],
      rating: 4.9,
    });
    if (error) console.error(`    ❌  trainer: ${error.message}`);
    else       console.log("    ✓  Emeka Nwosu CSCS");
  }

  // ── Activity Feed ──────────────────────────────────────────────────
  console.log("\n  Seeding activity feed…");
  const trainerUid    = byEmail["trainer@wefit.ng"];
  const userUid       = byEmail["user@wefit.ng"];
  const influencerUid = byEmail["influencer@wefit.ng"];
  const gymownerUid   = byEmail["gymowner@wefit.ng"];
  const vendorUid     = byEmail["vendor@wefit.ng"];

  const hoursAgo = h => new Date(Date.now() - h * 3600_000).toISOString();

  const feed = [
    { user_id: trainerUid,    username: "Emeka Nwosu",    action_type: "achievement", action_description: "earned the Iron Will badge 🏆",               created_at: hoursAgo(1)  },
    { user_id: trainerUid,    username: "Emeka Nwosu",    action_type: "workout",     action_description: "completed HIIT Finisher — 440 kcal burned 💪", created_at: hoursAgo(2)  },
    { user_id: userUid,       username: "Chidi Okonkwo",  action_type: "streak",      action_description: "hit a 14-day workout streak 🔥",               created_at: hoursAgo(3)  },
    { user_id: influencerUid, username: "Tunde Oladele",  action_type: "workout",     action_description: "crushed Leg Day — 410 kcal burned 💪",         created_at: hoursAgo(5)  },
    { user_id: gymownerUid,   username: "Bola Adebisi",   action_type: "challenge",   action_description: "joined the Burn 5,000 Calories challenge ⚡",  created_at: hoursAgo(8)  },
    { user_id: userUid,       username: "Chidi Okonkwo",  action_type: "meal",        action_description: "logged Jollof Rice + Grilled Chicken 🍽️",      created_at: hoursAgo(10) },
    { user_id: vendorUid,     username: "Kemi Adeyemi",   action_type: "joined",      action_description: "joined WeFit — welcome to the movement! 🎉",   created_at: hoursAgo(24) },
    { user_id: trainerUid,    username: "Emeka Nwosu",    action_type: "rank",        action_description: "reached Rank #1 on the leaderboard 👑",        created_at: hoursAgo(25) },
    { user_id: influencerUid, username: "Tunde Oladele",  action_type: "achievement", action_description: "hit a 21-day streak — unstoppable! 🔥",        created_at: hoursAgo(48) },
    { user_id: gymownerUid,   username: "Bola Adebisi",   action_type: "workout",     action_description: "completed Gym Circuit — 350 kcal burned 💪",   created_at: hoursAgo(50) },
  ].filter(e => e.user_id);

  const { error: fe } = await supabase.from("activity_feed").insert(feed);
  if (fe) console.error(`    ❌  activity_feed: ${fe.message}`);
  else    console.log(`    ✓  ${feed.length} entries`);

  console.log("\n✅  Done!\n");
  console.log("  Seed accounts (password: OneFitness):");
  console.log("  ─────────────────────────────────────────────────");
  for (const u of SEED_USERS) {
    console.log(`  ${u.email.padEnd(26)} → ${u.profile.role.padEnd(12)} ${u.profile.plan}`);
  }
  console.log();
}

seed().catch(err => { console.error("Fatal:", err); process.exit(1); });
