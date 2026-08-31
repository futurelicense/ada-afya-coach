import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Share2, DollarSign, Loader2 } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = useBusinessStats("influencer", user?.id);

  const accept = async (id: string) => {
    const { error } = await supabase.from("influencer_partnerships").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">Influencer Hub</h1>
        <p className="text-muted-foreground">WeFit followers, profile views, and paid brand partnerships.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Followers", value: stats.loading ? "…" : String(stats.countA), icon: Users },
          { label: "Profile views", value: stats.loading ? "…" : String(stats.countB), icon: Eye },
          { label: "Partnerships", value: stats.rating, icon: Share2 },
          { label: "Revenue (paid)", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user?.id && <ListingEditor kind="influencer" userId={user.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Partnerships</CardTitle>
          <CardDescription>Brands pay your listed rate on Explore. Accept after payment lands.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : stats.rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No partnerships yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(row.when).toLocaleString()} · {naira(row.amount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{row.status}</Badge>
                    {row.status === "paid" && (
                      <Button size="sm" variant="outline" onClick={() => void accept(row.id)}>Accept</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerDashboard;
