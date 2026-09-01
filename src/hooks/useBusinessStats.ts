import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const NEW_ROW_MESSAGE: Record<BusinessKind, string> = {
  vendor: "New order received",
  trainer: "New session booked",
  gym: "New membership",
  influencer: "New partnership request",
};

export interface MoneyRow {
  id: string;
  label: string;
  amount: number;
  status: string;
  when: string;
  party?: string;
}

export type BusinessKind = "vendor" | "trainer" | "gym" | "influencer";

export interface BusinessStats {
  loading: boolean;
  listingId: string | null;
  revenue: number;
  countA: number;
  countB: number;
  rating: string;
  rows: MoneyRow[];
  refresh: () => Promise<void>;
}

const LISTING_TABLE: Record<BusinessKind, string> = {
  vendor: "vendors",
  trainer: "public_trainers",
  gym: "gyms",
  influencer: "influencers",
};

const TXN_TABLE: Record<BusinessKind, string> = {
  vendor: "orders",
  trainer: "bookings",
  gym: "gym_memberships",
  influencer: "influencer_partnerships",
};

function paidStatuses(kind: BusinessKind) {
  if (kind === "vendor") return ["confirmed", "preparing", "ready", "delivered"];
  if (kind === "trainer") return ["confirmed", "completed"];
  if (kind === "gym") return ["active"];
  return ["paid", "accepted"];
}

export function useBusinessStats(kind: BusinessKind, userId: string | undefined): BusinessStats {
  const [loading, setLoading] = useState(true);
  const [listingId, setListingId] = useState<string | null>(null);
  const [revenue, setRevenue] = useState(0);
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const [rating, setRating] = useState("—");
  const [rows, setRows] = useState<MoneyRow[]>([]);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (kind === "vendor") {
        const { data: listing } = await supabase.from("vendors").select("id, rating").eq("user_id", userId).maybeSingle();
        setListingId(listing?.id ?? null);
        if (!listing) { setRows([]); setRevenue(0); setCountA(0); setCountB(0); return; }
        const { data: orders } = await supabase.from("orders").select("*").eq("vendor_id", listing.id).order("created_at", { ascending: false });
        const list = orders ?? [];
        const paid = list.filter((o) => paidStatuses("vendor").includes(o.status));
        setRevenue(paid.reduce((s, o) => s + (o.total_naira ?? 0), 0));
        setCountA(list.filter((o) => o.status === "pending" || o.status === "confirmed").length);
        setCountB(new Set(paid.map((o) => o.user_id)).size);
        setRating(listing.rating ? String(listing.rating) : "—");
        setRows(list.map((o) => ({
          id: o.id,
          label: Array.isArray(o.items) ? o.items.map((i: { name: string }) => i.name).join(", ") : "Order",
          amount: o.total_naira ?? 0,
          status: o.status,
          when: o.created_at,
        })));
      } else if (kind === "trainer") {
        const { data: listing } = await supabase.from("public_trainers").select("id, rating").eq("user_id", userId).maybeSingle();
        setListingId(listing?.id ?? null);
        if (!listing) { setRows([]); return; }
        const { data: bookings } = await supabase.from("bookings").select("*").eq("trainer_id", listing.id).order("scheduled_at", { ascending: false });
        const list = bookings ?? [];
        const paid = list.filter((b) => paidStatuses("trainer").includes(b.status));
        const weekAgo = Date.now() - 7 * 86400000;
        setRevenue(paid.reduce((s, b) => s + (b.amount_naira ?? 0), 0));
        setCountA(new Set(paid.map((b) => b.user_id)).size);
        setCountB(paid.filter((b) => new Date(b.scheduled_at).getTime() >= weekAgo).length);
        setRating(listing.rating ? String(listing.rating) : "—");
        setRows(list.map((b) => ({
          id: b.id,
          label: `${b.session_type} · ${new Date(b.scheduled_at).toLocaleString()}`,
          amount: b.amount_naira ?? 0,
          status: b.status,
          when: b.created_at,
        })));
      } else if (kind === "gym") {
        const { data: listing } = await supabase.from("gyms").select("id, rating, capacity").eq("user_id", userId).maybeSingle();
        setListingId(listing?.id ?? null);
        if (!listing) { setRows([]); return; }
        const { data: mems } = await supabase.from("gym_memberships").select("*").eq("gym_id", listing.id).order("created_at", { ascending: false });
        const list = mems ?? [];
        const active = list.filter((m) => m.status === "active");
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        const monthRev = active.filter((m) => new Date(m.starts_at ?? m.created_at) >= monthStart).reduce((s, m) => s + (m.amount_naira ?? 0), 0);
        setRevenue(monthRev);
        setCountA(active.length);
        const cap = listing.capacity || 80;
        setCountB(Math.min(100, Math.round((active.length / cap) * 100)));
        setRating(listing.rating ? String(listing.rating) : "—");
        setRows(list.map((m) => ({
          id: m.id,
          label: m.plan_name ?? m.plan_id,
          amount: m.amount_naira ?? 0,
          status: m.status,
          when: m.created_at,
        })));
      } else {
        const { data: listing } = await supabase.from("influencers").select("id, follower_count, view_count").eq("user_id", userId).maybeSingle();
        setListingId(listing?.id ?? null);
        if (!listing) { setRows([]); return; }
        const { data: parts } = await supabase.from("influencer_partnerships").select("*").eq("influencer_id", listing.id).order("created_at", { ascending: false });
        const list = parts ?? [];
        const paid = list.filter((p) => paidStatuses("influencer").includes(p.status));
        setRevenue(paid.reduce((s, p) => s + (p.amount_naira ?? 0), 0));
        setCountA(listing.follower_count ?? 0);
        setCountB(listing.view_count ?? 0);
        setRating(String(paid.length));
        setRows(list.map((p) => ({
          id: p.id,
          label: "Partnership",
          amount: p.amount_naira ?? 0,
          status: p.status,
          when: p.created_at,
        })));
      }
    } finally {
      setLoading(false);
    }
  }, [kind, userId]);

  useEffect(() => { void load(); }, [load]);

  // Live-refresh + toast when a transaction row for this business changes.
  useEffect(() => {
    if (!userId || !listingId) return;
    const fkCol: Record<BusinessKind, string> = {
      vendor: "vendor_id", trainer: "trainer_id", gym: "gym_id", influencer: "influencer_id",
    };
    // postgres_changes only streams changes made after subscribe — no backlog to filter out.
    const channel = supabase
      .channel(`biz-${kind}-${listingId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: TXN_TABLE[kind], filter: `${fkCol[kind]}=eq.${listingId}` },
        (payload) => {
          if (payload.eventType === "INSERT") toast({ title: NEW_ROW_MESSAGE[kind] });
          void load();
        })
      .on("postgres_changes", { event: "*", schema: "public", table: LISTING_TABLE[kind], filter: `user_id=eq.${userId}` }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [kind, userId, listingId, load]);

  return { loading, listingId, revenue, countA, countB, rating, rows, refresh: load };
}
