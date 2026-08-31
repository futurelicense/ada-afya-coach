import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Dumbbell, Star } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { GymPlanEditor } from "@/components/GymPlanEditor";
import { GymMemberRoster } from "@/components/GymMemberRoster";
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

      <GymPlanEditor gymId={stats.listingId} onSaved={() => void stats.refresh()} />

      <GymMemberRoster gymId={stats.listingId} />

      <InquiryInbox listingId={stats.listingId} />
    </div>
  );
};

export default GymOwnerDashboard;
