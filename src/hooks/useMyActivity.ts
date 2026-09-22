import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface MyOrder {
  id: string; status: string; total_naira: number; delivery_address: string | null;
  created_at: string; vendor_name: string;
}
export interface MyBooking {
  id: string; status: string; session_type: string; scheduled_at: string;
  duration_minutes: number; amount_naira: number; created_at: string; trainer_name: string;
}
export interface MyMembership {
  id: string; status: string; plan_name: string | null; amount_naira: number;
  months: number; starts_at: string | null; ends_at: string | null; created_at: string; gym_name: string;
}
export interface MyPartnership {
  id: string; status: string; amount_naira: number; notes: string | null;
  created_at: string; influencer_name: string;
}

function relName(rel: unknown, fallback: string): string {
  const row = Array.isArray(rel) ? rel[0] : rel;
  return (row as { name?: string } | null)?.name ?? fallback;
}

export function useMyActivity(userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [memberships, setMemberships] = useState<MyMembership[]>([]);
  const [partnerships, setPartnerships] = useState<MyPartnership[]>([]);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [ordersRes, bookingsRes, membershipsRes, partnershipsRes] = await Promise.all([
        supabase.from("orders")
          .select("id, status, total_naira, delivery_address, created_at, vendors(name)")
          .eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("bookings")
          .select("id, status, session_type, scheduled_at, duration_minutes, amount_naira, created_at, public_trainers(name)")
          .eq("user_id", userId).order("scheduled_at", { ascending: false }),
        supabase.from("gym_memberships")
          .select("id, status, plan_name, amount_naira, months, starts_at, ends_at, created_at, gyms(name)")
          .eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("influencer_partnerships")
          .select("id, status, amount_naira, notes, created_at, influencers(name)")
          .eq("brand_user_id", userId).order("created_at", { ascending: false }),
      ]);

      setOrders((ordersRes.data ?? []).map((o) => ({
        id: o.id, status: o.status, total_naira: o.total_naira,
        delivery_address: o.delivery_address, created_at: o.created_at,
        vendor_name: relName(o.vendors, "Vendor"),
      })));
      setBookings((bookingsRes.data ?? []).map((b) => ({
        id: b.id, status: b.status, session_type: b.session_type, scheduled_at: b.scheduled_at,
        duration_minutes: b.duration_minutes, amount_naira: b.amount_naira, created_at: b.created_at,
        trainer_name: relName(b.public_trainers, "Trainer"),
      })));
      setMemberships((membershipsRes.data ?? []).map((m) => ({
        id: m.id, status: m.status, plan_name: m.plan_name, amount_naira: m.amount_naira,
        months: m.months, starts_at: m.starts_at, ends_at: m.ends_at, created_at: m.created_at,
        gym_name: relName(m.gyms, "Gym"),
      })));
      setPartnerships((partnershipsRes.data ?? []).map((p) => ({
        id: p.id, status: p.status, amount_naira: p.amount_naira, notes: p.notes, created_at: p.created_at,
        influencer_name: relName(p.influencers, "Influencer"),
      })));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`my-activity-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${userId}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_memberships", filter: `user_id=eq.${userId}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "influencer_partnerships", filter: `brand_user_id=eq.${userId}` }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, load]);

  return { loading, orders, bookings, memberships, partnerships, refresh: load };
}
