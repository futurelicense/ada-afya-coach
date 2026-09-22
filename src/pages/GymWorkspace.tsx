import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, Dumbbell, Star, CalendarClock } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { GymPlanEditor } from "@/components/GymPlanEditor";
import { GymMemberRoster } from "@/components/GymMemberRoster";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { ROLE_THEME } from "@/lib/roleTheme";

interface ExpiringMember { id: string; name: string; ends_at: string; }

function useExpiringSoon(gymId: string | null) {
  const [members, setMembers] = useState<ExpiringMember[]>([]);
  useEffect(() => {
    if (!gymId) { setMembers([]); return; }
    supabase.rpc("gym_members", { p_gym: gymId }).then(({ data }) => {
      const weekOut = Date.now() + 7 * 86400000;
      const list = ((data as { id: string; name: string; status: string; ends_at: string | null }[]) ?? [])
        .filter((m) => m.status === "active" && m.ends_at && new Date(m.ends_at).getTime() <= weekOut)
        .sort((a, b) => new Date(a.ends_at!).getTime() - new Date(b.ends_at!).getTime());
      setMembers(list.map((m) => ({ id: m.id, name: m.name, ends_at: m.ends_at! })));
    });
  }, [gymId]);
  return members;
}

function ExpiringSoonCard({ gymId }: { gymId: string | null }) {
  const members = useExpiringSoon(gymId);
  if (members.length === 0) return null;
  return (
    <Card className={ROLE_THEME.gym_owner.border}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className={`h-4 w-4 ${ROLE_THEME.gym_owner.icon}`} /> Expiring this week
        </CardTitle>
        <CardDescription>Reach out before these memberships lapse.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm border rounded-lg p-2">
              <span>{m.name}</span>
              <Badge variant="destructive">{new Date(m.ends_at).toLocaleDateString()}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const HEADINGS: Record<string, { title: string; sub: string }> = {
  home:     { title: "Gym Dashboard",  sub: "Paid memberships from Explore." },
  members:  { title: "Members",        sub: "Active memberships, expiry and manual extend." },
  plans:    { title: "Membership plans", sub: "Price and length of each tier." },
  listing:  { title: "Public listing", sub: "What members see and pay on Explore." },
  requests: { title: "Requests",       sub: "Members who asked to be contacted." },
};

export default function GymWorkspace() {
  const { section = "home" } = useParams();
  const { user } = useAuth();
  const stats = useBusinessStats("gym", user?.id);
  const head = HEADINGS[section] ?? HEADINGS.home;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">{head.title}</h1>
        <p className="text-muted-foreground">{head.sub}</p>
      </div>

      {section === "home" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Active members", value: stats.loading ? "…" : String(stats.countA), icon: Users },
              { label: "Revenue this month", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
              { label: "Rating", value: stats.rating, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className={ROLE_THEME.gym_owner.border}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className={`h-7 w-7 rounded-lg ${ROLE_THEME.gym_owner.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${ROLE_THEME.gym_owner.icon}`} />
                  </div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
              </Card>
            ))}
          </div>
          <Card className={ROLE_THEME.gym_owner.border}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className={`h-4 w-4 ${ROLE_THEME.gym_owner.icon}`} /> Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={stats.loading ? 0 : stats.countB} className="flex-1" />
                <span className="text-sm font-semibold w-12 text-right">{stats.loading ? "…" : `${stats.countB}%`}</span>
              </div>
            </CardContent>
          </Card>
          <ExpiringSoonCard gymId={stats.listingId} />
          <GymMemberRoster gymId={stats.listingId} />
        </>
      )}

      {section === "members" && <GymMemberRoster gymId={stats.listingId} />}
      {section === "plans" && <GymPlanEditor gymId={stats.listingId} onSaved={() => void stats.refresh()} />}
      {section === "listing" && user?.id && <ListingEditor kind="gym" userId={user.id} />}
      {section === "requests" && <InquiryInbox listingId={stats.listingId} />}
    </div>
  );
}
