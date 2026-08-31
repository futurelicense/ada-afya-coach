import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, MapPin, Phone, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ExploreVendor, fetchDirectory } from "@/lib/exploreService";
import { naira, startMarketplaceCheckout } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";

interface MenuRow {
  id: string;
  name: string;
  description: string | null;
  price_naira: number;
  category_id: string | null;
  category_name: string | null;
  category_sort: number;
  in_stock: boolean;
}

export const MealDeliverySystem = () => {
  const [vendors, setVendors] = useState<ExploreVendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [menu, setMenu] = useState<MenuRow[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sending, setSending] = useState(false);
  const [myOrders, setMyOrders] = useState<Array<{ id: string; status: string; total_naira: number; created_at: string }>>([]);

  const vendor = vendors.find((v) => v.id === vendorId);

  useEffect(() => {
    fetchDirectory().then((d) => {
      setVendors(d.vendors);
      if (d.vendors[0]) setVendorId(d.vendors[0].id);
    }).catch(() => undefined);
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: orders } = await supabase.from("orders")
        .select("id, status, total_naira, created_at")
        .eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(10);
      setMyOrders(orders ?? []);
    });
  }, []);

  const loadMenu = useCallback(async (id: string) => {
    setMenuLoading(true);
    setCart({});
    const { data } = await supabase.rpc("vendor_menu", { p_vendor: id });
    setMenu((data as MenuRow[]) ?? []);
    setMenuLoading(false);
  }, []);

  useEffect(() => { if (vendorId) void loadMenu(vendorId); }, [vendorId, loadMenu]);

  const setQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
  };

  const lines = Object.entries(cart).map(([id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return item ? { item, qty } : null;
  }).filter(Boolean) as { item: MenuRow; qty: number }[];

  const subtotal = lines.reduce((s, l) => s + l.item.price_naira * l.qty, 0);
  const total = subtotal + (vendor?.deliveryFee ?? 0);

  const pay = async () => {
    if (!vendor) {
      toast({ title: "No kitchen selected", variant: "destructive" });
      return;
    }
    if (lines.length === 0 || !deliveryAddress || !phoneNumber) {
      toast({ title: "Missing details", description: "Add dishes, a delivery address and phone.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await startMarketplaceCheckout({
        kind: "meal_order",
        listingId: vendor.id,
        items: lines.map((l) => ({ menu_item_id: l.item.id, name: l.item.name, price_naira: l.item.price_naira, qty: l.qty })),
        address: deliveryAddress,
        phone: phoneNumber,
        callbackPath: "/nutrition",
      });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Checkout failed", description: err instanceof Error ? err.message : "Sign in and try again." });
      setSending(false);
    }
  };

  // group menu by category, in listing order
  const cats = Array.from(new Map(menu.map((m) => [m.category_id ?? "none", { id: m.category_id, name: m.category_name, sort: m.category_sort }])).values())
    .sort((a, b) => a.sort - b.sort);

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Order from a WeFit kitchen
        </CardTitle>
        <CardDescription>Paid with Paystack. The vendor sees the order after payment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No vendors have published a listing yet.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Kitchen</Label>
              <div className="flex flex-wrap gap-2">
                {vendors.map((v) => (
                  <Button key={v.id} type="button" size="sm" variant={vendorId === v.id ? "default" : "outline"} onClick={() => setVendorId(v.id)}>
                    {v.name}
                  </Button>
                ))}
              </div>
            </div>

            {menuLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : menu.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">This kitchen hasn't added any dishes yet.</p>
            ) : (
              cats.map((c) => (
                <div key={c.id ?? "none"} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.name ?? "Menu"}</p>
                  {menu.filter((m) => (m.category_id ?? null) === (c.id ?? null)).map((item) => {
                    const qty = cart[item.id] ?? 0;
                    return (
                      <div key={item.id} className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${item.in_stock ? "" : "opacity-50"}`}>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {naira(item.price_naira)}{item.description ? ` · ${item.description}` : ""}
                            {!item.in_stock && " · sold out"}
                          </p>
                        </div>
                        {item.in_stock && (
                          qty === 0 ? (
                            <Button size="sm" variant="outline" onClick={() => setQty(item.id, 1)}>Add</Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                              <span className="text-sm w-4 text-center">{qty}</span>
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {lines.length > 0 && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                {lines.map((l) => (
                  <div key={l.item.id} className="flex justify-between">
                    <span>{l.qty}× {l.item.name}</span>
                    <span>{naira(l.item.price_naira * l.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-muted-foreground pt-1 border-t">
                  <span>Delivery</span><span>{naira(vendor?.deliveryFee ?? 0)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Delivery address</Label>
              <div className="flex gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                <Input id="address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            </div>

            <Button onClick={() => void pay()} className="w-full" size="lg" disabled={sending || lines.length === 0}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Pay {naira(total)}
            </Button>
          </>
        )}

        {myOrders.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-semibold">Your orders</p>
            {myOrders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm border rounded-md p-2">
                <span>{new Date(o.created_at).toLocaleString()}</span>
                <span>{naira(o.total_naira)} · {o.status}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
