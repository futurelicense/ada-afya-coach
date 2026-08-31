import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { naira } from "@/lib/marketplaceService";

interface Member {
  id: string;
  user_id: string;
  name: string;
  plan_name: string | null;
  status: string;
  amount_naira: number;
  starts_at: string | null;
  ends_at: string | null;
}

function membershipState(m: Member): { label: string; variant: "secondary" | "outline" | "destructive" } {
  if (m.status !== "active") return { label: m.status, variant: "outline" };
  if (!m.ends_at) return { label: "active", variant: "secondary" };
  const days = Math.ceil((new Date(m.ends_at).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "expired", variant: "destructive" };
  if (days <= 7) return { label: `${days}d left`, variant: "destructive" };
  return { label: `${days}d left`, variant: "secondary" };
}

/** Members of this gym with status + expiry, plus manual extend. Backed by gym_members() / gym_extend_membership(). */
export function GymMemberRoster({ gymId }: { gymId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);

  const load = useCallback(async () => {
    if (!gymId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.rpc("gym_members", { p_gym: gymId });
    setMembers((data as Member[]) ?? []);
    setLoading(false);
  }, [gymId]);

  useEffect(() => { void load(); }, [load]);

  const extend = async (id: string, months: number) => {
    const { error } = await supabase.rpc("gym_extend_membership", { p_membership: id, p_months: months });
    if (error) toast({ variant: "destructive", title: error.message });
    else { toast({ title: `Extended ${months} month${months === 1 ? "" : "s"}` }); void load(); }
  };

  if (!gymId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Paid memberships. Extend or comp time directly.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : members.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => {
              const st = membershipState(m);
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.plan_name ?? "Membership"} · {naira(m.amount_naira)}
                      {m.ends_at ? ` · ends ${new Date(m.ends_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <Button size="sm" variant="outline" onClick={() => void extend(m.id, 1)}>+1 mo</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
