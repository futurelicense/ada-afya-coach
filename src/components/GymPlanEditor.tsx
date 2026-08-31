import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  amount_naira: number;
  months: number;
}

const DEFAULTS: Plan[] = [
  { id: "monthly", name: "Monthly", amount_naira: 25000, months: 1 },
  { id: "quarterly", name: "Quarterly", amount_naira: 65000, months: 3 },
  { id: "yearly", name: "Yearly", amount_naira: 240000, months: 12 },
];

/** Edit each membership tier independently. Backed by gyms.membership_plans (jsonb). */
export function GymPlanEditor({ gymId, onSaved }: { gymId: string | null; onSaved?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(DEFAULTS);

  const load = useCallback(async () => {
    if (!gymId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("gyms").select("membership_plans").eq("id", gymId).maybeSingle();
    const existing = Array.isArray(data?.membership_plans) ? (data!.membership_plans as Plan[]) : null;
    setPlans(existing && existing.length ? existing : DEFAULTS);
    setLoading(false);
  }, [gymId]);

  useEffect(() => { void load(); }, [load]);

  const patch = (idx: number, key: keyof Plan, value: string) => {
    setPlans((prev) => prev.map((p, i) =>
      i === idx ? { ...p, [key]: key === "amount_naira" || key === "months" ? Math.max(0, Math.round(Number(value) || 0)) : value } : p,
    ));
  };

  const save = async () => {
    if (!gymId) return;
    setSaving(true);
    const { error } = await supabase.from("gyms").update({ membership_plans: plans }).eq("id", gymId);
    setSaving(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    toast({ title: "Plans updated", description: "Members see the new prices on Explore." });
    onSaved?.();
  };

  if (!gymId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership plans</CardTitle>
        <CardDescription>Set the price and length of each tier members can buy.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {plans.map((p, i) => (
              <div key={p.id} className="grid gap-2 sm:grid-cols-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={p.name} onChange={(e) => patch(i, "name", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price (₦)</Label>
                  <Input inputMode="numeric" value={String(p.amount_naira)} onChange={(e) => patch(i, "amount_naira", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Months</Label>
                  <Input inputMode="numeric" value={String(p.months)} onChange={(e) => patch(i, "months", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}
        <Button onClick={() => void save()} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save plans
        </Button>
      </CardContent>
    </Card>
  );
}
