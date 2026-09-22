import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { naira } from "@/lib/marketplaceService";

interface Category { id: string; name: string; sort: number; }
interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price_naira: number;
  available: boolean;
  quantity: number | null;
  category_id: string | null;
}

const UNCATEGORISED = "__none__";

/** Full menu management for a vendor: categories + items with stock quantity. */
export function MenuManager({ vendorId }: { vendorId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [catName, setCatName] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("");
  const [cat, setCat] = useState(UNCATEGORISED);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from("vendor_menu_categories").select("id, name, sort").eq("vendor_id", vendorId).order("sort"),
      supabase.from("vendor_menu_items").select("id, name, description, price_naira, available, quantity, category_id").eq("vendor_id", vendorId).order("created_at"),
    ]);
    setCats((c as Category[]) ?? []);
    setItems((i as MenuItem[]) ?? []);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { void load(); }, [load]);

  const addCategory = async () => {
    if (!vendorId || !catName.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("vendor_menu_categories").insert({
      vendor_id: vendorId, name: catName.trim(), sort: cats.length,
    });
    setBusy(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    setCatName(""); void load();
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase.from("vendor_menu_categories").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else void load();
  };

  const addItem = async () => {
    if (!vendorId || !name.trim() || !price) return;
    setBusy(true);
    const { error } = await supabase.from("vendor_menu_items").insert({
      vendor_id: vendorId,
      name: name.trim(),
      description: desc.trim() || null,
      price_naira: Math.max(0, Math.round(Number(price) || 0)),
      quantity: qty === "" ? null : Math.max(0, Math.round(Number(qty) || 0)),
      category_id: cat === UNCATEGORISED ? null : cat,
    });
    setBusy(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    setName(""); setPrice(""); setDesc(""); setQty("");
    void load();
  };

  const patchItem = async (id: string, patch: Partial<MenuItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    const { error } = await supabase.from("vendor_menu_items").update(patch).eq("id", id);
    if (error) { toast({ variant: "destructive", title: error.message }); void load(); }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("vendor_menu_items").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setItems((prev) => prev.filter((it) => it.id !== id));
  };

  if (!vendorId) return <p className="text-sm text-muted-foreground">Publish your kitchen first (Listing tab).</p>;
  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const groups: { cat: Category | null; list: MenuItem[] }[] = [
    ...cats.map((c) => ({ cat: c, list: items.filter((i) => i.category_id === c.id) })),
    { cat: null, list: items.filter((i) => !i.category_id) },
  ].filter((g) => g.list.length > 0 || g.cat);

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Group your dishes (e.g. Swallow, Soups, Drinks, Sides).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                {c.name}
                <button onClick={() => void removeCategory(c.id)} aria-label={`Remove ${c.name}`}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </button>
              </span>
            ))}
            {cats.length === 0 && <span className="text-sm text-muted-foreground">No categories yet.</span>}
          </div>
          <div className="flex gap-2">
            <Input placeholder="New category" value={catName} onChange={(e) => setCatName(e.target.value)} className="max-w-xs" />
            <Button variant="outline" onClick={() => void addCategory()} disabled={busy || !catName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add item */}
      <Card>
        <CardHeader><CardTitle>Add a dish</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Dish name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCATEGORISED}>Uncategorised</SelectItem>
                {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input inputMode="numeric" placeholder="₦ price" value={price} onChange={(e) => setPrice(e.target.value)} />
              <Input inputMode="numeric" placeholder="Qty (blank = ∞)" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>
          <Button className="mt-3" onClick={() => void addItem()} disabled={busy || !name.trim() || !price}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add dish</>}
          </Button>
        </CardContent>
      </Card>

      {/* Menu list */}
      {groups.map((g) => (
        <Card key={g.cat?.id ?? "none"}>
          <CardHeader className="pb-2"><CardTitle className="text-base">{g.cat?.name ?? "Uncategorised"}</CardTitle></CardHeader>
          <CardContent>
            {g.list.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No dishes in this category.</p>
            ) : (
              <ul className="space-y-2">
                {g.list.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 border rounded-lg p-3">
                    <div className="flex-1 min-w-[140px]">
                      <p className={`font-medium text-sm ${item.available ? "" : "line-through text-muted-foreground"}`}>{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {naira(item.price_naira)}{item.description ? ` · ${item.description}` : ""}
                      </p>
                    </div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      Qty
                      <Input
                        className="h-8 w-20"
                        inputMode="numeric"
                        value={item.quantity ?? ""}
                        placeholder="∞"
                        onChange={(e) => {
                          const v = e.target.value;
                          patchItem(item.id, { quantity: v === "" ? null : Math.max(0, Math.round(Number(v) || 0)) });
                        }}
                      />
                    </label>
                    <Switch checked={item.available} onCheckedChange={(v) => void patchItem(item.id, { available: v })} aria-label="Available" />
                    <Button size="icon" variant="ghost" onClick={() => void removeItem(item.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
