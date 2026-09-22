import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Users, DollarSign, Star, Loader2, AlertTriangle } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { MenuManager } from "@/components/MenuManager";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ROLE_THEME } from "@/lib/roleTheme";

interface LowStockItem { id: string; name: string; quantity: number; }

function useLowStock(vendorId: string | null) {
  const [items, setItems] = useState<LowStockItem[]>([]);
  useEffect(() => {
    if (!vendorId) { setItems([]); return; }
    supabase.from("vendor_menu_items")
      .select("id, name, quantity")
      .eq("vendor_id", vendorId)
      .eq("available", true)
      .not("quantity", "is", null)
      .lte("quantity", 3)
      .order("quantity", { ascending: true })
      .then(({ data }) => setItems((data as LowStockItem[]) ?? []));
  }, [vendorId]);
  return items;
}

function LowStockCard({ vendorId }: { vendorId: string | null }) {
  const items = useLowStock(vendorId);
  if (items.length === 0) return null;
  return (
    <Card className="border-secondary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-secondary" /> Restock needed
        </CardTitle>
        <CardDescription>Dishes running low or sold out on your menu.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between text-sm border rounded-lg p-2">
              <span>{i.name}</span>
              <Badge variant={i.quantity === 0 ? "destructive" : "outline"}>
                {i.quantity === 0 ? "Sold out" : `${i.quantity} left`}
              </Badge>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link to="/vendor/menu">Update stock</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
    const { error } = await supabase.rpc("transition_marketplace_record", {
      p_kind: "order",
      p_record_id: id,
      p_new_status: status,
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
              { label: "Open orders", value: stats.loading ? "…" : String(stats.countA), icon: Package },
              { label: "Revenue (paid)", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
              { label: "Paying customers", value: stats.loading ? "…" : String(stats.countB), icon: Users },
              { label: "Rating", value: stats.rating, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className={ROLE_THEME.vendor.border}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className={`h-7 w-7 rounded-lg ${ROLE_THEME.vendor.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${ROLE_THEME.vendor.icon}`} />
                  </div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
              </Card>
            ))}
          </div>
          <LowStockCard vendorId={stats.listingId} />
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
          <EmptyState icon={Package} title="No orders yet" description="Meal orders members pay for on Explore will land here." />
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
