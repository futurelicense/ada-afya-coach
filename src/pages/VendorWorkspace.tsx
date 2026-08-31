import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Users, DollarSign, Star, Loader2 } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { MenuManager } from "@/components/MenuManager";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const HEADINGS: Record<string, { title: string; sub: string }> = {
  home:     { title: "Vendor Dashboard", sub: "Paid meal orders from members." },
  menu:     { title: "Menu",             sub: "Categories, dishes, prices and stock." },
  orders:   { title: "Orders",           sub: "Confirm, prepare and deliver paid orders." },
  listing:  { title: "Public listing",   sub: "What members see and pay on Explore." },
  requests: { title: "Requests",         sub: "Members who asked to be contacted." },
};

export default function VendorWorkspace() {
  const { section = "home" } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = useBusinessStats("vendor", user?.id);
  const head = HEADINGS[section] ?? HEADINGS.home;

  const advance = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
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
              { label: "Open orders", value: stats.loading ? "…" : String(stats.countA), icon: Package },
              { label: "Revenue (paid)", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
              { label: "Paying customers", value: stats.loading ? "…" : String(stats.countB), icon: Users },
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
          <OrderList rows={stats.rows} loading={stats.loading} advance={advance} limit={5} />
        </>
      )}

      {section === "menu" && <MenuManager vendorId={stats.listingId} />}

      {section === "orders" && <OrderList rows={stats.rows} loading={stats.loading} advance={advance} />}

      {section === "listing" && user?.id && <ListingEditor kind="vendor" userId={user.id} />}

      {section === "requests" && <InquiryInbox listingId={stats.listingId} />}
    </div>
  );
}

function OrderList({
  rows, loading, advance, limit,
}: {
  rows: { id: string; label: string; amount: number; status: string; when: string }[];
  loading: boolean;
  advance: (id: string, status: string) => void;
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <Card>
      <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {shown.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{row.label || "Order"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(row.when).toLocaleString()} · {naira(row.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{row.status}</Badge>
                  {row.status === "confirmed" && (
                    <Button size="sm" variant="outline" onClick={() => advance(row.id, "preparing")}>Preparing</Button>
                  )}
                  {row.status === "preparing" && (
                    <Button size="sm" variant="outline" onClick={() => advance(row.id, "delivered")}>Delivered</Button>
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
