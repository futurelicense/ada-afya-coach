import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Kind = "vendor" | "trainer" | "gym" | "influencer";

interface ListingEditorProps {
  kind: Kind;
  userId: string;
}

export function ListingEditor({ kind, userId }: ListingEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");

  const table =
    kind === "vendor" ? "vendors" :
    kind === "trainer" ? "public_trainers" :
    kind === "gym" ? "gyms" : "influencers";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from(table).select("*").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      setRow(data);
      if (data) {
        setName(data.name ?? "");
        setCity(data.city ?? data.address ?? "");
        setPhone(data.phone ?? "");
        setBio(data.description ?? data.bio ?? data.niche ?? "");
        const p =
          kind === "trainer" ? data.price_per_session_naira :
          kind === "vendor" ? data.delivery_fee_naira :
          kind === "influencer" ? data.partnership_rate_naira :
          Array.isArray(data.membership_plans) ? data.membership_plans[0]?.amount_naira : 25000;
        setPrice(String(p ?? ""));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [kind, table, userId]);

  const save = async () => {
    setSaving(true);
    try {
      const amount = Math.max(0, Math.round(Number(price) || 0));
      const patch: Record<string, unknown> = { name, published: true };
      if (kind === "vendor") {
        Object.assign(patch, { city, address: city, phone, description: bio, delivery_fee_naira: amount });
      } else if (kind === "trainer") {
        Object.assign(patch, { city, bio, price_per_session_naira: amount });
      } else if (kind === "gym") {
        Object.assign(patch, {
          city,
          address: city,
          phone,
          description: bio,
          membership_plans: [
            { id: "monthly", name: "Monthly", amount_naira: amount, months: 1 },
            { id: "quarterly", name: "Quarterly", amount_naira: Math.round(amount * 2.6), months: 3 },
            { id: "yearly", name: "Yearly", amount_naira: Math.round(amount * 9.6), months: 12 },
          ],
        });
      } else {
        Object.assign(patch, { niche: bio, partnership_rate_naira: amount });
      }

      if (row?.id) {
        const { error } = await supabase.from(table).update(patch).eq("id", row.id).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert({ ...patch, user_id: userId });
        if (error) throw error;
      }
      toast({ title: "Listing published", description: "Members will see this on Explore." });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not save listing",
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const priceLabel =
    kind === "trainer" ? "Session price (₦)" :
    kind === "vendor" ? "Delivery fee (₦)" :
    kind === "gym" ? "Monthly membership (₦)" :
    "Partnership rate (₦)";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your public listing</CardTitle>
        <CardDescription>This is what members see and pay for on Explore.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City / area</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          {kind !== "trainer" && kind !== "influencer" && (
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>{priceLabel}</Label>
            <Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{kind === "influencer" ? "Niche" : "Bio"}</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        <Button onClick={() => void save()} disabled={saving || !name.trim()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save listing
        </Button>
      </CardContent>
    </Card>
  );
}
