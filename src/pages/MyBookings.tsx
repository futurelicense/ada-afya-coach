import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UtensilsCrossed, Dumbbell, Building2, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyActivity } from "@/hooks/useMyActivity";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", confirmed: "secondary", preparing: "secondary", ready: "secondary",
  delivered: "default", completed: "default", active: "default", paid: "secondary",
  accepted: "default", cancelled: "destructive", declined: "destructive", expired: "destructive",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_TONE[status] ?? "outline"}>{status}</Badge>;
}

export default function MyBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading, orders, bookings, memberships, partnerships, refresh } = useMyActivity(user?.id);

  const cancelPartnership = async (id: string) => {
    const { error } = await supabase.rpc("transition_marketplace_record", {
      p_kind: "brand_partnership",
      p_record_id: id,
      p_new_status: "cancelled",
    });
    if (error) toast({ variant: "destructive", title: error.message });
    else await refresh();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Everything you've ordered, booked, joined or sponsored on WeFit.</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="orders"><UtensilsCrossed className="h-4 w-4 mr-1.5" /> Meal Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="bookings"><Dumbbell className="h-4 w-4 mr-1.5" /> Trainer Sessions ({bookings.length})</TabsTrigger>
          <TabsTrigger value="memberships"><Building2 className="h-4 w-4 mr-1.5" /> Gym Membership ({memberships.length})</TabsTrigger>
          <TabsTrigger value="partnerships"><Share2 className="h-4 w-4 mr-1.5" /> Partnerships ({partnerships.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle>Meal orders</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <EmptyState icon={UtensilsCrossed} title="No meal orders yet" description="Order from a vendor on Explore." action={{ label: "Browse vendors", to: "/explore" }} />
              ) : (
                <ul className="space-y-3">
                  {orders.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{o.vendor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleString()} · {naira(o.total_naira)}
                          {o.delivery_address ? ` · ${o.delivery_address}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader><CardTitle>Trainer sessions</CardTitle></CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <EmptyState icon={Dumbbell} title="No trainer sessions booked yet" description="Find a trainer on Explore." action={{ label: "Browse trainers", to: "/explore" }} />
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{b.trainer_name} · {b.session_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.scheduled_at).toLocaleString()} · {b.duration_minutes} min · {naira(b.amount_naira)}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memberships">
          <Card>
            <CardHeader><CardTitle>Gym membership</CardTitle></CardHeader>
            <CardContent>
              {memberships.length === 0 ? (
                <EmptyState icon={Building2} title="No gym membership yet" description="Join a gym on Explore." action={{ label: "Browse gyms", to: "/explore" }} />
              ) : (
                <ul className="space-y-3">
                  {memberships.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{m.gym_name} · {m.plan_name ?? `${m.months}mo plan`}</p>
                        <p className="text-xs text-muted-foreground">
                          {naira(m.amount_naira)}
                          {m.ends_at ? ` · expires ${new Date(m.ends_at).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={m.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships">
          <Card>
            <CardHeader><CardTitle>Influencer partnerships</CardTitle></CardHeader>
            <CardContent>
              {partnerships.length === 0 ? (
                <EmptyState icon={Share2} title="No partnerships yet" description="Sponsor an influencer on Explore." action={{ label: "Browse influencers", to: "/explore" }} />
              ) : (
                <ul className="space-y-3">
                  {partnerships.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{p.influencer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleString()} · {naira(p.amount_naira)}
                          {p.notes ? ` · ${p.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        {p.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => void cancelPartnership(p.id)}>Cancel</Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
