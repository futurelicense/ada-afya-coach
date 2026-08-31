import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, MapPin, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { ExploreVendor, fetchDirectory } from "@/lib/exploreService";
import { naira, startMarketplaceCheckout } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";

const FALLBACK_PRICE: Record<string, number> = {
  "Jollof Rice with Grilled Chicken": 2500,
  "Egusi Soup with Pounded Yam": 3000,
  "Beans Porridge with Plantain": 1800,
};

export const MealDeliverySystem = () => {
  const { todayMeals } = useUserData();
  const [vendors, setVendors] = useState<ExploreVendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [myOrders, setMyOrders] = useState<Array<{ id: string; status: string; total_naira: number; created_at: string; items: unknown }>>([]);

  const availableMeals = todayMeals.filter((m) => !m.eaten);
  const vendor = vendors.find((v) => v.id === vendorId);

  useEffect(() => {
    fetchDirectory().then((d) => {
      setVendors(d.vendors);
      if (d.vendors[0]) setVendorId(d.vendors[0].id);
    }).catch(() => undefined);
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: orders } = await supabase.from("orders").select("id, status, total_naira, created_at, items").eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(20);
      setMyOrders(orders ?? []);
    });
  }, []);

  const priceOf = (name: string) => FALLBACK_PRICE[name] || 2000;

  const pay = async () => {
    if (!vendor) {
      toast({ title: "No vendor listed yet", description: "A meal vendor must publish a kitchen first.", variant: "destructive" });
      return;
    }
    if (selectedMeals.length === 0 || !deliveryAddress || !phoneNumber) {
      toast({ title: "Missing details", description: "Select meals, address, and phone.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await startMarketplaceCheckout({
        kind: "meal_order",
        listingId: vendor.id,
        items: selectedMeals.map((name) => ({ name, price_naira: priceOf(name) })),
        address: deliveryAddress,
        phone: phoneNumber,
        callbackPath: "/nutrition",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Sign in and try again.",
      });
      setSending(false);
    }
  };

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Order from a WeFit kitchen
        </CardTitle>
        <CardDescription>
          Paid with Paystack. The vendor sees the order on their dashboard after payment.
        </CardDescription>
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

            {availableMeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Generate a meal plan first, then order those dishes.</p>
            ) : (
              availableMeals.map((meal) => {
                const selected = selectedMeals.includes(meal.name);
                return (
                  <div
                    key={meal.id}
                    onClick={() => setSelectedMeals((prev) => selected ? prev.filter((n) => n !== meal.name) : [...prev, meal.name])}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        <span className="font-medium">{meal.name}</span>
                      </div>
                      <Badge variant="secondary">{naira(priceOf(meal.name))}</Badge>
                    </div>
                  </div>
                );
              })
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

            <Button onClick={() => void pay()} className="w-full" size="lg" disabled={sending || selectedMeals.length === 0}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Pay {naira(selectedMeals.reduce((s, n) => s + priceOf(n), 0) + (vendor?.deliveryFee ?? 0))}
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
