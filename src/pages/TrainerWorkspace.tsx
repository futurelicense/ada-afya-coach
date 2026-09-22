import { useParams, Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Star, Loader2, Radio, Clock3 } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { TrainerAvailabilityEditor } from "@/components/TrainerAvailabilityEditor";
import { ClientRoster } from "@/components/ClientRoster";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ROLE_THEME } from "@/lib/roleTheme";

const LiveStreamStudio = lazy(() =>
  import("@/components/LiveStreamStudio").then((module) => ({ default: module.LiveStreamStudio })),
);

interface NextSession { id: string; scheduled_at: string; session_type: string; duration_minutes: number; }

function useNextSession(trainerId: string | null) {
  const [session, setSession] = useState<NextSession | null>(null);
  useEffect(() => {
    if (!trainerId) { setSession(null); return; }
    const load = () => {
      void supabase.from("bookings")
        .select("id, scheduled_at, session_type, duration_minutes")
        .eq("trainer_id", trainerId)
        .eq("status", "confirmed")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .then(({ data }) => setSession((data?.[0] as NextSession) ?? null));
    };
    load();
    const channel = supabase
      .channel(`trainer-next-session:${trainerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `trainer_id=eq.${trainerId}` },
        load,
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [trainerId]);
  return session;
}

function NextSessionCard({ trainerId }: { trainerId: string | null }) {
  const session = useNextSession(trainerId);
  return (
    <Card className={ROLE_THEME.trainer.border}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock3 className={`h-4 w-4 ${ROLE_THEME.trainer.icon}`} /> Next session
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {session ? (
          <div>
            <p className="text-sm font-medium capitalize">{session.session_type} session</p>
            <p className="text-xs text-muted-foreground">
              {new Date(session.scheduled_at).toLocaleString()} · {session.duration_minutes} min
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming confirmed sessions.</p>
        )}
        <Button asChild size="sm" variant="outline">
          <Link to="/trainer/live"><Radio className="h-4 w-4 mr-1.5" /> Go Live</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
    const { error } = await supabase.rpc("transition_marketplace_record", {
      p_kind: "booking",
      p_record_id: id,
      p_new_status: "completed",
    });
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
              <Card key={label} className={ROLE_THEME.trainer.border}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className={`h-7 w-7 rounded-lg ${ROLE_THEME.trainer.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${ROLE_THEME.trainer.icon}`} />
                  </div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
              </Card>
            ))}
          </div>
          <NextSessionCard trainerId={stats.listingId} />
          <BookingList rows={stats.rows} loading={stats.loading} complete={complete} limit={5} />
        </>
      )}

      {section === "bookings" && <BookingList rows={stats.rows} loading={stats.loading} complete={complete} />}
      {section === "clients" && <ClientRoster trainerId={stats.listingId} />}
      {section === "availability" && <TrainerAvailabilityEditor trainerId={stats.listingId} />}
      {section === "live" && (
        <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground" role="status">Loading broadcast studio…</div>}>
          <LiveStreamStudio trainerId={user?.id ?? ""} trainerName={profile?.name || "Trainer"} />
        </Suspense>
      )}
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
          <EmptyState icon={Calendar} title="No bookings yet" description="Sessions members pay for on Explore will land here." />
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
