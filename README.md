# WeFit

Nigeria's AI fitness platform. AI-generated workouts and Nigerian-cuisine meal
plans, an AI coach chat, food-photo scanning, plus a marketplace connecting
members with meal vendors, personal trainers, gyms, and fitness influencers.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript, React Router, TanStack Query, shadcn/ui, Tailwind, PWA |
| Backend | Supabase — Postgres + Auth + Storage + Realtime + RLS |
| Edge functions | Deno (Supabase Functions) |
| AI | Groq (OpenAI-compatible) — `openai/gpt-oss-120b` for text/tools, HF `Qwen2.5-VL` for food-photo vision |
| Payments | Paystack (NGN) — subscriptions + marketplace checkout |
| Live video | Agora RTC |

## Roles

`user` (member), `vendor`, `trainer`, `gym_owner`, `influencer`, `admin`.
Each business role gets its own multi-page workspace (`/vendor`, `/trainer`,
`/gym`, `/influencer`) and a public listing on `/explore`. Admins get `/admin`.

## Local development

```bash
npm install
cp .env.example .env      # fill in your Supabase project URL + anon key
npm run dev               # http://localhost:8080
```

`npm run build` · `npm run lint` · `npm test` (Vitest).

## Backend setup

1. Create a Supabase project, put its URL + anon key in `.env`.
2. Apply the schema: run `supabase/COMPLETE_SCHEMA.sql`, then every file in
   `supabase/migrations/` in order (011 onward, and 012+ via `supabase db push`).
3. Seed accounts (one per role, password `OneFitness`):
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed-users.mjs
   SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed-demo.mjs   # menus, availability, demo data
   ```
4. Deploy the edge functions and set their secrets — see
   `supabase/DEPLOY_FUNCTIONS.md`.

## Edge function secrets

```
GROQ_API_KEY, HF_API_TOKEN              # AI
PAYSTACK_SECRET_KEY, SITE_URL           # payments
AGORA_APP_ID, AGORA_APP_CERTIFICATE     # live streaming
VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY     # web push  (also set VITE_VAPID_PUBLIC_KEY in the frontend env)
```
