import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Star, Loader2 } from "lucide-react";
import { LiveStreamStudio } from "@/components/LiveStreamStudio";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { TrainerAvailabilityEditor } from "@/components/TrainerAvailabilityEditor";
import { ClientRoster } from "@/components/ClientRoster";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const HEADINGS: Record<string, { title: string; sub: string }> = {
  home:        { title: "Trainer Dashboard", sub: "Paid sessions, clients and live broadcasts." },
  bookings:    { title: "Bookings",          sub: "Members pay on Explore. Confirmed sessions land here." },
  clients:     { title: "Clients",           sub: "Everyone who has booked you." },
  availability:{ title: "Availability",      sub: "The hours you're open each week." },
  live:        { title: "Go Live",           sub: "Broadcast a session to pro & elite members." },
  listing:     { title: "Public listing",    sub: "What members see and pay on Explore." },
  requests:    { title: "Requests",          sub: "Members who asked to be contacted." },
};

export default function TrainerWorkspace() {
  const { section = "home" } = useParams();
  const { user } = useAuth();
  const { profile } = useUserData();
  const { toast } = useToast();
  const stats = useBusinessStats("trainer", user?.id);
  const head = HEADINGS[section] ?? HEADINGS.home;

  const complete = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else await stats.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">{head.title}</h1>
        <p className="text-muted-foreground">{head.sub}</p>
      </div>

      {section === "home" && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Paying clients", value: stats.loading ? "…" : String(stats.countA), icon: Users },
              { label: "Sessions this week", value: stats.loading ? "…" : String(stats.countB), icon: Calendar },
              { label: "Revenue (paid)", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
              { label: "Rating", value: stats.rating, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
              </Card>
            ))}
          </div>
          <BookingList rows={stats.rows} loading={stats.loading} complete={complete} limit={5} />
        </>
      )}

      {section === "bookings" && <BookingList rows={stats.rows} loading={stats.loading} complete={complete} />}
      {section === "clients" && <ClientRoster trainerId={stats.listingId} />}
      {section === "availability" && <TrainerAvailabilityEditor trainerId={stats.listingId} />}
      {section === "live" && <LiveStreamStudio trainerId={user?.id ?? ""} trainerName={profile?.name || "Trainer"} />}
      {section === "listing" && user?.id && <ListingEditor kind="trainer" userId={user.id} />}
      {section === "requests" && <InquiryInbox listingId={stats.listingId} />}
    </div>
  );
}

function BookingList({
  rows, loading, complete, limit,
}: {
  rows: { id: string; label: string; amount: number; status: string }[];
  loading: boolean;
  complete: (id: string) => void;
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <Card>
      <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <ul className="space-y-3">
            {shown.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{naira(row.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{row.status}</Badge>
                  {row.status === "confirmed" && (
                    <Button size="sm" variant="outline" onClick={() => complete(row.id)}>Mark complete</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
