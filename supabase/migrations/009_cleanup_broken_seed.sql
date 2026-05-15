-- Remove broken seed users inserted directly via SQL in migration 008.
-- Those records have NULL token fields that GoTrue requires to be empty strings,
-- causing 500 errors on every auth attempt. The admin API (seed-users.mjs) will
-- recreate them properly.
--
-- ON DELETE CASCADE propagates to: auth.identities, profiles, gamification,
-- workout_sessions, meal_logs, daily_stats, subscriptions, activity_feed, etc.

DELETE FROM auth.users
WHERE email IN (
  'user@wefit.ng',
  'vendor@wefit.ng',
  'trainer@wefit.ng',
  'gymowner@wefit.ng',
  'influencer@wefit.ng',
  'admin@wefit.ng'
);
