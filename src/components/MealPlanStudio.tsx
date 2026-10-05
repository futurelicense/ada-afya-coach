import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { JOURNEY_FOCUSES, type JourneyFocus } from "@/lib/journey";
import { supabase } from "@/lib/supabase";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

interface Incoming {
  id: string;
  status: string;
  title: string;
  member: string;
}

export function MealPlanStudio({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState<JourneyFocus>("reduce-belly-fat");
  const [price, setPrice] = useState("15000");
  const [meals, setMeals] = useState<Record<string, { name: string; calories: string }>>({
    breakfast: { name: "", calories: "" },
    lunch: { name: "", calories: "" },
    dinner: { name: "", calories: "" },
    snack: { name: "", calories: "" },
  });
  const [saving, setSaving] = useState(false);
  const [incoming, setIncoming] = useState<Incoming[]>([]);
  const [groupLocks, setGroupLocks] = useState<Array<{ id: string; title: string; groupName: string }>>([]);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("journey_requests")
      .select("id, status, vendor_meal_plans(title)")
      .eq("kind", "meal_plan");
    if (error) {
      if (/journey_requests|schema cache|does not exist/i.test(error.message)) setSchemaMissing(true);
      return;
    }
    setIncoming((data ?? []).map((row) => {
      const plan = row.vendor_meal_plans as { title?: string } | { title?: string }[] | null;
      const titleText = Array.isArray(plan) ? plan[0]?.title : plan?.title;
      return { id: row.id as string, status: row.status as string, title: titleText || "Meal plan", member: "Member" };
    }).filter((row) => row.title));
    const locks = await supabase
      .from("group_meal_locks")
      .select("id, vendor_meal_plans(title), workout_groups(name)")
      .eq("status", "locked");
    if (!locks.error) {
      setGroupLocks((locks.data ?? []).map((row) => {
        const plan = row.vendor_meal_plans as { title?: string } | { title?: string }[] | null;
        const group = row.workout_groups as { name?: string } | { name?: string }[] | null;
        return {
          id: row.id as string,
          title: (Array.isArray(plan) ? plan[0]?.title : plan?.title) || "Meal plan",
          groupName: (Array.isArray(group) ? group[0]?.name : group?.name) || "Group",
        };
      }));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("vendors").select("id").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      setVendorId(data?.id ?? null);
      await loadRequests();
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const save = async () => {
    if (!vendorId) return;
    const rows = MEAL_TYPES.flatMap((mealType) => {
      const meal = meals[mealType];
      if (!meal.name.trim()) return [];
      return [{ name: meal.name.trim(), meal_type: mealType, calories: Math.max(0, Number(meal.calories) || 0) }];
    });
    if (!title.trim() || !rows.length) {
      toast({ variant: "destructive", title: "Add a title and at least one meal" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("vendor_meal_plans").insert({
        vendor_id: vendorId,
        focus,
        title: title.trim(),
        price_naira: Math.max(0, Math.round(Number(price) || 0)),
        meals: rows,
        published: true,
      });
      if (error) throw error;
      toast({ title: "Meal plan published", description: "Members on this journey can request it." });
      setTitle("");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
      toast({ variant: "destructive", title: "Could not publish the plan", description: message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!vendorId) return <Card><CardHeader><CardTitle>Publish your listing first</CardTitle></CardHeader></Card>;
  if (schemaMissing) return <Card><CardHeader><CardTitle>Meal plan tables are not on the database yet</CardTitle><CardDescription>Apply supabase/migrations/023_journey_offers.sql, then open this page again.</CardDescription></CardHeader></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Journey meal plan</CardTitle>
          <CardDescription>A day of meals for one journey focus. A member request shows up here for you to accept.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div>
            <div className="space-y-1.5"><Label>Price (₦)</Label><Input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {JOURNEY_FOCUSES.map((item) => (
              <Button key={item.id} type="button" size="sm" variant={focus === item.id ? "default" : "outline"} onClick={() => setFocus(item.id)}>{item.title}</Button>
            ))}
          </div>
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="grid gap-2 sm:grid-cols-[8rem_1fr_6rem] sm:items-center">
              <Label className="capitalize">{mealType}</Label>
              <Input placeholder="Dish" value={meals[mealType].name} onChange={(event) => setMeals((current) => ({ ...current, [mealType]: { ...current[mealType], name: event.target.value } }))} />
              <Input inputMode="numeric" placeholder="kcal" value={meals[mealType].calories} onChange={(event) => setMeals((current) => ({ ...current, [mealType]: { ...current[mealType], calories: event.target.value } }))} />
            </div>
          ))}
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish meal plan
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Groups that locked a plan</CardTitle>
          <CardDescription>A group appears here after every member agrees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupLocks.length === 0 ? <p className="text-sm text-muted-foreground">No group has locked a plan yet.</p> : groupLocks.map((row) => (
            <p key={row.id} className="text-sm">{row.groupName} · {row.title}</p>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Requests for your meal plans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {incoming.length === 0 ? <p className="text-sm text-muted-foreground">No member has requested a plan yet.</p> : incoming.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{row.member}</p>
                <p className="text-muted-foreground">{row.title} · {row.status}</p>
              </div>
              {row.status === "requested" ? (
                <Button size="sm" variant="outline" onClick={async () => {
                  const { error } = await supabase.from("journey_requests").update({ status: "accepted" }).eq("id", row.id);
                  if (error) toast({ variant: "destructive", title: "Could not accept", description: error.message });
                  else void loadRequests();
                }}>Accept</Button>
              ) : <span className="text-xs">Accepted</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
