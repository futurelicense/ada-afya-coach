import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { naira } from "@/lib/marketplaceService";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price_naira: number;
  available: boolean;
}

/** Dishes members can order. Backed by vendor_menu_items; shown on Explore / Nutrition. */
export function VendorMenuEditor({ vendorId }: { vendorId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("vendor_menu_items")
      .select("id, name, description, price_naira, available")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: true });
    setItems((data as MenuItem[]) ?? []);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!vendorId || !name.trim() || !price) return;
    setAdding(true);
    const { error } = await supabase.from("vendor_menu_items").insert({
      vendor_id: vendorId,
      name: name.trim(),
      description: desc.trim() || null,
      price_naira: Math.max(0, Math.round(Number(price) || 0)),
    });
    setAdding(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    setName(""); setPrice(""); setDesc("");
    void load();
  };

  const toggle = async (item: MenuItem) => {
    const { error } = await supabase.from("vendor_menu_items").update({ available: !item.available }).eq("id", item.id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("vendor_menu_items").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (!vendorId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu</CardTitle>
        <CardDescription>Dishes members can order and pay for. Toggle off anything you've run out of.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <ul className="space-y-2">
            {items.length === 0 && (
              <li className="text-sm text-muted-foreground py-2">No dishes yet — add your first below.</li>
            )}
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 border rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${item.available ? "" : "line-through text-muted-foreground"}`}>{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {naira(item.price_naira)}{item.description ? ` · ${item.description}` : ""}
                  </p>
                </div>
                <Switch checked={item.available} onCheckedChange={() => void toggle(item)} aria-label="Available" />
                <Button size="icon" variant="ghost" onClick={() => void remove(item.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto] items-end">
          <div className="space-y-1">
            <Input placeholder="Dish name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Short description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <Input inputMode="numeric" placeholder="₦ price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Button onClick={() => void add()} disabled={adding || !name.trim() || !price}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
