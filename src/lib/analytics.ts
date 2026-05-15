import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (!POSTHOG_KEY || import.meta.env.DEV) return;
  posthog.init(POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
    capture_pageview: false, // manual for SPA
    persistence: "localStorage",
    autocapture: false,
  });
}

export function identifyUser(id: string, props?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.identify(id, props);
}

export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export function trackPageView(path: string) {
  if (!POSTHOG_KEY) return;
  posthog.capture("$pageview", { $current_url: path });
}

// Key product events
export const track = {
  workoutStarted:     (name: string, duration: number) => capture("workout_started",        { name, duration }),
  workoutCompleted:   (name: string, calories: number) => capture("workout_completed",       { name, calories }),
  mealLogged:         (name: string, calories: number) => capture("meal_logged",             { name, calories }),
  aiWorkoutGenerated: (difficulty: string)             => capture("ai_workout_generated",    { difficulty }),
  aiMealGenerated:    (dietPreference: string)         => capture("ai_meal_generated",       { dietPreference }),
  paymentInitiated:   (plan: string, amount: number)   => capture("payment_initiated",       { plan, amount }),
  paymentCompleted:   (plan: string)                   => capture("payment_completed",       { plan }),
  liveSessionJoined:  (sessionId: string, trainer: string) => capture("live_session_joined",{ sessionId, trainer }),
  challengeJoined:    (challengeId: string, title: string) => capture("challenge_joined",   { challengeId, title }),
  chatMessageSent:    (context: "ai_coach" | "live_chat")  => capture("chat_message_sent",  { context }),
  foodScanned:        ()                               => capture("food_scanned",            {}),
  pushSubscribed:     ()                               => capture("push_subscribed",         {}),
};

function capture(event: string, props: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, props);
}
