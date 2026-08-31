import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Dumbbell, Star, Loader2 } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";

const GymOwnerDashboard = () => {
  const { user } = useAuth();
  const stats = useBusinessStats("gym", user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">Gym Owner Dashboard</h1>
        <p className="text-muted-foreground">Paid memberships from Explore. Set your monthly price on the listing below.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active members", value: stats.loading ? "…" : String(stats.countA), icon: Users },
          { label: "Revenue this month", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
          { label: "Occupancy", value: stats.loading ? "…" : `${stats.countB}%`, icon: Dumbbell },
          { label: "Rating", value: stats.rating, icon: Star },
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

      {user?.id && <ListingEditor kind="gym" userId={user.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Memberships</CardTitle>
          <CardDescription>Live Paystack checkouts from members.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : stats.rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No memberships yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-2 border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(row.when).toLocaleString()} · {naira(row.amount)}</p>
                  </div>
                  <Badge variant="secondary">{row.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GymOwnerDashboard;
