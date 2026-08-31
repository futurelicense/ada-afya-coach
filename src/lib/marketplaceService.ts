import { supabase } from "./supabase";

export type MarketplaceKind = "meal_order" | "trainer_booking" | "gym_membership" | "partnership";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function ensureBusinessListing(userId: string, role: string): Promise<void> {
  if (!["vendor", "trainer", "gym_owner", "influencer"].includes(role)) return;
  const { error } = await supabase.rpc("ensure_business_listing", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
}

export async function startMarketplaceCheckout(payload: {
  kind: MarketplaceKind;
  listingId: string;
  callbackPath?: string;
  items?: Array<{ menu_item_id?: string; name: string; price_naira: number; qty?: number }>;
  address?: string;
  phone?: string;
  planId?: string;
  scheduledAt?: string;
  sessionType?: string;
  inPerson?: boolean;
  notes?: string;
}): Promise<void> {
  const headers = await authHeaders();
  const callbackUrl = `${window.location.origin}${payload.callbackPath ?? "/explore"}?payment=success`;
  const res = await fetch(`${FUNCTIONS_URL}/paystack-initialize`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...payload, callbackUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
  window.location.href = data.authorization_url;
}

export function naira(n: number | null | undefined): string {
  return `₦${Math.round(Number(n) || 0).toLocaleString()}`;
}
