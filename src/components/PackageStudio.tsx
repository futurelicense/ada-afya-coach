import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Pitch {
  id: string;
  status: string;
  title: string;
  groupName: string;
}

export function PackageStudio({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [title, setTitle] = useState("");
  const [months, setMonths] = useState("1");
  const [sessions, setSessions] = useState("8");
  const [price, setPrice] = useState("40000");
  const [saving, setSaving] = useState(false);
  const [pitches, setPitches] = useState<Pitch[]>([]);

  const loadPitches = async () => {
    const { data, error } = await supabase
      .from("group_trainer_pitches")
      .select("id, status, trainer_packages(title), workout_groups(name)");
    if (error) {
      if (/trainer_packages|group_trainer_pitches|schema cache|does not exist/i.test(error.message)) setSchemaMissing(true);
      return;
    }
    setPitches((data ?? []).map((row) => {
      const pack = row.trainer_packages as { title?: string } | { title?: string }[] | null;
      const group = row.workout_groups as { name?: string } | { name?: string }[] | null;
      return {
        id: row.id as string,
        status: row.status as string,
        title: (Array.isArray(pack) ? pack[0]?.title : pack?.title) || "Package",
        groupName: (Array.isArray(group) ? group[0]?.name : group?.name) || "Group",
      };
    }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("public_trainers").select("id").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      setTrainerId(data?.id ?? null);
      await loadPitches();
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!trainerId) return <Card><CardHeader><CardTitle>Publish your listing first</CardTitle></CardHeader></Card>;
  if (schemaMissing) return <Card><CardHeader><CardTitle>Package tables are not on the database yet</CardTitle><CardDescription>Apply supabase/migrations/024_workout_groups.sql, then open this page again.</CardDescription></CardHeader></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly package</CardTitle>
          <CardDescription>Groups can pitch this package. You mark a pitch booked.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} /></div>
          <div className="space-y-1.5"><Label>Months</Label><Input inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} /></div>
          <div className="space-y-1.5"><Label>Sessions each month</Label><Input inputMode="numeric" value={sessions} onChange={(event) => setSessions(event.target.value)} /></div>
          <div className="space-y-1.5"><Label>Price (₦)</Label><Input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} /></div>
          <div className="sm:col-span-2">
            <Button disabled={saving || !title.trim()} onClick={async () => {
              setSaving(true);
              try {
                const { error } = await supabase.from("trainer_packages").insert({
                  trainer_id: trainerId,
                  title: title.trim(),
                  months: Math.min(12, Math.max(1, Number(months) || 1)),
                  sessions_per_month: Math.min(20, Math.max(1, Number(sessions) || 1)),
                  price_naira: Math.max(0, Math.round(Number(price) || 0)),
                  published: true,
                });
                if (error) throw error;
                toast({ title: "Package published", description: "Groups can pitch it from their group page." });
                setTitle("");
              } catch (err: unknown) {
                const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
                toast({ variant: "destructive", title: "Could not publish the package", description: message });
              } finally {
                setSaving(false);
              }
            }}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Publish package</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Group pitches</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pitches.length === 0 ? <p className="text-sm text-muted-foreground">No group has pitched a package yet.</p> : pitches.map((pitch) => (
            <div key={pitch.id} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{pitch.groupName}</p>
                <p className="text-muted-foreground">{pitch.title} · {pitch.status}</p>
              </div>
              {pitch.status === "pitched" ? (
                <Button size="sm" variant="outline" onClick={async () => {
                  const { error } = await supabase.from("group_trainer_pitches").update({ status: "booked" }).eq("id", pitch.id);
                  if (error) toast({ variant: "destructive", title: "Could not book", description: error.message });
                  else void loadPitches();
                }}>Mark booked</Button>
              ) : <span className="text-xs">Booked</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
