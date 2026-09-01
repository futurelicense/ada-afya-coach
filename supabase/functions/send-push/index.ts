import * as webpush from "jsr:@negrel/webpush@0.3.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_ids?: string[];   // target specific users; omit to broadcast
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

const b64urlToBytes = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const bytesToB64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Build a VAPID JWK pair from the raw public (0x04||X||Y) + raw private scalar secrets.
function vapidJwks() {
  const pub = b64urlToBytes(Deno.env.get("VAPID_PUBLIC_KEY")!);      // 65 bytes
  const d = Deno.env.get("VAPID_PRIVATE_KEY")!;                       // b64url scalar
  const x = bytesToB64url(pub.slice(1, 33));
  const y = bytesToB64url(pub.slice(33, 65));
  return {
    publicKey:  { kty: "EC", crv: "P-256", x, y, key_ops: ["verify"], ext: true },
    privateKey: { kty: "EC", crv: "P-256", x, y, d, key_ops: ["sign"], ext: true },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body: PushPayload = await req.json();
    if (!body.title || !body.body) throw new Error("title and body are required");

    let query = supabase.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth");
    if (body.user_ids?.length) query = query.in("user_id", body.user_ids);
    const { data: subs, error } = await query;
    if (error) throw error;
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0, total: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const vapidKeys = await webpush.importVapidKeys(vapidJwks(), { extractable: false });
    const server = await webpush.ApplicationServer.new({
      contactInformation: `mailto:${Deno.env.get("VAPID_SUBJECT") ?? "admin@wefit.ng"}`,
      vapidKeys,
    });

    const message = JSON.stringify({
      title: body.title,
      body: body.body,
      icon: body.icon ?? "/icons/icon-192.png",
      tag: body.tag,
      data: { url: body.url ?? "/dashboard" },
    });

    let sent = 0;
    const stale: string[] = [];
    await Promise.all(subs.map(async (s) => {
      try {
        const subscriber = server.subscribe({
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        });
        await subscriber.pushTextMessage(message, {});
        sent++;
      } catch (err) {
        // 404/410 → subscription is dead; clean it up
        if (String(err).match(/\b(404|410)\b/)) stale.push(s.id);
      }
    }));

    if (stale.length) await supabase.from("push_subscriptions").delete().in("id", stale);

    return new Response(JSON.stringify({ sent, total: subs.length, pruned: stale.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
