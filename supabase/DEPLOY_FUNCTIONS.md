# Deploying the Edge Functions (Groq)

The console 404s (`functions/v1/generate-workout` etc.) mean the functions were never
deployed to project `njwbvbbsbowtfevsocnn`. Run these once, from the repo root.

## 1. Auth + link

```bash
supabase login            # opens browser for an access token
supabase link --project-ref njwbvbbsbowtfevsocnn
```

## 2. Set the server-side secrets

```bash
supabase secrets set GROQ_API_KEY=<your-groq-key>
supabase secrets set HF_API_TOKEN=<your-hf-token>          # scan-food vision fallback only
# Paystack (only if you want payments working too):
# supabase secrets set PAYSTACK_SECRET_KEY=sk_live_or_test_...
# supabase secrets set SITE_URL=https://wecoach.vercel.app
```

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — do not set them.

Optional model overrides (defaults shown):

```bash
# supabase secrets set GROQ_MODEL=llama-3.3-70b-versatile
# supabase secrets set GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

## 3. Deploy

```bash
# AI functions — JWT-verified (frontend sends the user's access token)
supabase functions deploy chat-ada generate-workout generate-meal-plan analyze-progress scan-food

# Payments / misc
supabase functions deploy paystack-initialize paystack-verify live-token send-push
supabase functions deploy paystack-webhook --no-verify-jwt   # Paystack calls this with no JWT
```

## 4. Verify

```bash
supabase functions list
curl -i -X OPTIONS https://njwbvbbsbowtfevsocnn.supabase.co/functions/v1/generate-workout
# expect: HTTP/2 200 with access-control-allow-* headers
```

Then trigger a workout/meal generation from the app while logged in.

## Notes

- The `AuthApiError: Invalid Refresh Token` / `LockManager lock` noise in the console is a
  stale browser session on the deployed domain — unrelated to the functions. It clears on
  next sign-in; a hard sign-out + sign-in removes it.
- Groq has no prompt caching, so the old `anthropic-beta: prompt-caching` headers are gone.
  The Nigerian-food knowledge block is now just part of the system prompt each call.
- `scan-food` uses Groq's `llama-4-scout` vision model; if that call fails it falls back to a
  Hugging Face caption model + Groq text pass (needs `HF_API_TOKEN`).
