import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { JOURNEY_FOCUSES, type JourneyFocus } from "@/lib/journey";
import { mediaObjectPath } from "@/lib/journeyOffers";
import { supabase } from "@/lib/supabase";

interface MoveDraft {
  name: string;
  sets: string;
  reps: string;
  cue: string;
  audio: File | null;
  clip: File | null;
}

interface Incoming {
  id: string;
  status: string;
  title: string;
  member: string;
}

const blankMove = (): MoveDraft => ({ name: "", sets: "3", reps: "10", cue: "", audio: null, clip: null });

export function RoutineStudio({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState<JourneyFocus>("reduce-belly-fat");
  const [price, setPrice] = useState("5000");
  const [moves, setMoves] = useState<MoveDraft[]>([blankMove()]);
  const [saving, setSaving] = useState(false);
  const [incoming, setIncoming] = useState<Incoming[]>([]);

  const load = async (id: string) => {
    const { data, error } = await supabase
      .from("journey_requests")
      .select("id, status, trainer_routines(title)")
      .eq("kind", "routine");
    if (error) {
      if (/journey_requests|schema cache|does not exist/i.test(error.message)) setSchemaMissing(true);
      return;
    }
    setIncoming((data ?? []).map((row) => {
      const routine = row.trainer_routines as { title?: string } | { title?: string }[] | null;
      const titleText = Array.isArray(routine) ? routine[0]?.title : routine?.title;
      return { id: row.id as string, status: row.status as string, title: titleText || "Routine", member: "Member" };
    }));
    void id;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("public_trainers").select("id").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      setTrainerId(data?.id ?? null);
      if (data?.id) await load(data.id);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const save = async () => {
    if (!trainerId) return;
    const ready = moves.filter((move) => move.name.trim());
    if (!title.trim() || !ready.length) {
      toast({ variant: "destructive", title: "Add a title and at least one move" });
      return;
    }
    setSaving(true);
    try {
      const { data: routine, error } = await supabase.from("trainer_routines").insert({
        trainer_id: trainerId,
        focus,
        title: title.trim(),
        price_naira: Math.max(0, Math.round(Number(price) || 0)),
        published: true,
      }).select("id").single();
      if (error || !routine) throw error ?? new Error("Could not save the routine.");

      for (const [index, move] of ready.entries()) {
        let audioPath: string | null = null;
        let clipPath: string | null = null;
        if (move.audio) {
          audioPath = mediaObjectPath(userId, move.audio);
          const { error: uploadError } = await supabase.storage.from("routine-media").upload(audioPath, move.audio);
          if (uploadError) throw uploadError;
        }
        if (move.clip) {
          clipPath = mediaObjectPath(userId, move.clip);
          const { error: uploadError } = await supabase.storage.from("routine-media").upload(clipPath, move.clip);
          if (uploadError) throw uploadError;
        }
        const { error: moveError } = await supabase.from("trainer_routine_moves").insert({
          routine_id: routine.id,
          sort: index,
          name: move.name.trim(),
          sets: Math.max(1, Number(move.sets) || 3),
          reps: Math.max(1, Number(move.reps) || 10),
          cue: move.cue.trim(),
          audio_path: audioPath,
          clip_path: clipPath,
        });
        if (moveError) throw moveError;
      }
      toast({ title: "Routine published", description: "Members on this journey can request it." });
      setTitle("");
      setMoves([blankMove()]);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
      toast({ variant: "destructive", title: "Could not publish the routine", description: message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!trainerId) return <Card><CardHeader><CardTitle>Publish your listing first</CardTitle><CardDescription>Routines attach to the trainer listing members already see.</CardDescription></CardHeader></Card>;
  if (schemaMissing) return <Card><CardHeader><CardTitle>Routine tables are not on the database yet</CardTitle><CardDescription>Apply supabase/migrations/023_journey_offers.sql, then open this page again.</CardDescription></CardHeader></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Journey routine</CardTitle>
          <CardDescription>One audio note and one demo clip for each move. Members request it for a matching journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Price (₦)</Label>
              <Input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {JOURNEY_FOCUSES.map((item) => (
              <Button key={item.id} type="button" size="sm" variant={focus === item.id ? "default" : "outline"} onClick={() => setFocus(item.id)}>
                {item.title}
              </Button>
            ))}
          </div>
          {moves.map((move, index) => (
            <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
              <Input placeholder="Move name" value={move.name} onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} />
              <Input placeholder="Cue" value={move.cue} onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, cue: event.target.value } : row))} />
              <Input inputMode="numeric" value={move.sets} onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, sets: event.target.value } : row))} />
              <Input inputMode="numeric" value={move.reps} onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, reps: event.target.value } : row))} />
              <label className="text-xs text-muted-foreground">Audio<input type="file" accept="audio/*" className="mt-1 block w-full text-sm" onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, audio: event.target.files?.[0] ?? null } : row))} /></label>
              <label className="text-xs text-muted-foreground">Demo clip<input type="file" accept="video/*" className="mt-1 block w-full text-sm" onChange={(event) => setMoves((rows) => rows.map((row, i) => i === index ? { ...row, clip: event.target.files?.[0] ?? null } : row))} /></label>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setMoves((rows) => [...rows, blankMove()])}>Add move</Button>
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish routine
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests for your routines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {incoming.length === 0 ? <p className="text-sm text-muted-foreground">No member has requested a routine yet.</p> : incoming.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{row.member}</p>
                <p className="text-muted-foreground">{row.title} · {row.status}</p>
              </div>
              {row.status === "requested" ? (
                <Button size="sm" variant="outline" onClick={async () => {
                  const { error } = await supabase.from("journey_requests").update({ status: "accepted" }).eq("id", row.id);
                  if (error) toast({ variant: "destructive", title: "Could not accept", description: error.message });
                  else if (trainerId) void load(trainerId);
                }}>Accept</Button>
              ) : <span className="text-xs">Accepted</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
