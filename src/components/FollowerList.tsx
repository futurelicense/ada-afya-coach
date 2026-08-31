import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Follower {
  follower_id: string;
  name: string;
  since: string;
}

/** WeFit members following this influencer. Backed by the influencer_followers() RPC. */
export function FollowerList({ influencerId }: { influencerId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<Follower[]>([]);

  const load = useCallback(async () => {
    if (!influencerId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.rpc("influencer_followers", { p_influencer: influencerId });
    setFollowers((data as Follower[]) ?? []);
    setLoading(false);
  }, [influencerId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!influencerId) return;
    const ch = supabase
      .channel(`followers-${influencerId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "influencer_follows", filter: `influencer_id=eq.${influencerId}` }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [influencerId, load]);

  if (!influencerId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Followers</CardTitle>
        <CardDescription>Members following you on WeFit.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : followers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No followers yet.</p>
        ) : (
          <ul className="space-y-2">
            {followers.map((f) => (
              <li key={f.follower_id} className="flex items-center justify-between gap-2 border rounded-lg p-3">
                <p className="font-medium text-sm">{f.name}</p>
                <span className="text-xs text-muted-foreground">since {new Date(f.since).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
