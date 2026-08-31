-- Extra inquiry kinds used by Explore (nutritionist + event interest)
alter table public.inquiries drop constraint if exists inquiries_type_check;

alter table public.inquiries
  add constraint inquiries_type_check
  check (type in (
    'gym_membership',
    'trainer_booking',
    'meal_order',
    'nutritionist_booking',
    'event_interest'
  ));
