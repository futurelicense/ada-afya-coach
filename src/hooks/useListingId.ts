import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { BusinessKind } from "@/hooks/useBusinessStats";

const TABLE: Record<BusinessKind, string> = {
  vendor: "vendors",
  trainer: "public_trainers",
  gym: "gyms",
  influencer: "influencers",
};

/** The current user's listing id for a business role, or null while loading / if none exists. */
export function useListingId(kind: BusinessKind): { listingId: string | null; loading: boolean } {
  const { user } = useAuth();
  const [listingId, setListingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    supabase.from(TABLE[kind]).select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      setListingId(data?.id ?? null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [kind, user?.id]);

  return { listingId, loading };
}
