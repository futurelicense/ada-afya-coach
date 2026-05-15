import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_ids?: string[];     // target specific users; omit to broadcast to all
  title: string;
  body: string;
  icon?: string;
  url?: string;            // click action URL
  tag?: string;            // for notification deduplication
}

// VAPID / Web Push implementation using Web Crypto API
// Keys must be set via: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=...
async function buildVapidJwt(audience: string): Promise<string> {
  const privateKeyB64 = Deno.env.get("VAPID_PRIVATE_KEY")!;
  const subject = `mailto:${Deno.env.get("VAPID_SUBJECT") ?? "admin@wefit.ng"}`;

  const header = { alg: "ES256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = { aud: audience, exp: now + 43200, sub: subject };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const sigInput = `${encode(header)}.${encode(claims)}`;

  // Import the raw EC P-256 private key (expected as base64url-encoded raw 32-byte scalar)
  const rawKey = Uint8Array.from(atob(privateKeyB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(sigInput),
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${sigInput}.${sigB64}`;
}

async function sendWebPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string): Promise<boolean> {
  const url = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  try {
    const jwt = await buildVapidJwt(audience);
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY")!;

    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${jwt},k=${vapidPublic}`,
        "Content-Type": "application/octet-stream",
        TTL: "86400",
      },
      body: new TextEncoder().encode(payload),
    });
    return res.status === 200 || res.status === 201;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const body: PushPayload = await req.json();

  let query = supabase.from("push_subscriptions").select("user_id, endpoint, p256dh, auth");
  if (body.user_ids?.length) {
    query = query.in("user_id", body.user_ids);
  }

  const { data: subs, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  const payload = JSON.stringify({
    title:   body.title,
    body:    body.body,
    icon:    body.icon ?? "/icons/icon-192.png",
    url:     body.url ?? "/dashboard",
    tag:     body.tag,
    data:    { url: body.url ?? "/dashboard" },
  });

  const results = await Promise.allSettled(
    (subs ?? []).map(sub => sendWebPush(sub, payload)),
  );

  const sent = results.filter(r => r.status === "fulfilled" && r.value).length;

  return new Response(JSON.stringify({ sent, total: subs?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
