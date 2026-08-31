import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  id: string;
  weekday: number;
  start_min: number;
  end_min: number;
}

const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const toMin = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Recurring weekly slots members can book against. Backed by trainer_availability. */
export function TrainerAvailabilityEditor({ trainerId }: { trainerId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [weekday, setWeekday] = useState("1");
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("08:00");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!trainerId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("trainer_availability")
      .select("id, weekday, start_min, end_min")
      .eq("trainer_id", trainerId)
      .order("weekday", { ascending: true })
      .order("start_min", { ascending: true });
    setSlots((data as Slot[]) ?? []);
    setLoading(false);
  }, [trainerId]);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!trainerId) return;
    const s = toMin(start), e = toMin(end);
    if (e <= s) { toast({ variant: "destructive", title: "End time must be after start." }); return; }
    setAdding(true);
    const { error } = await supabase.from("trainer_availability").insert({
      trainer_id: trainerId, weekday: Number(weekday), start_min: s, end_min: e,
    });
    setAdding(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("trainer_availability").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  if (!trainerId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly availability</CardTitle>
        <CardDescription>The hours you're open for sessions each week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {DAYS.map((day, idx) => {
              const daySlots = slots.filter((s) => s.weekday === idx);
              if (daySlots.length === 0) return null;
              return (
                <div key={day} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium w-24">{day}</span>
                  {daySlots.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                      {hhmm(s.start_min)}–{hhmm(s.end_min)}
                      <button onClick={() => void remove(s.id)} aria-label="Remove slot"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              );
            })}
            {slots.length === 0 && <p className="text-sm text-muted-foreground py-2">No hours set yet.</p>}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_110px_110px_auto] items-end">
          <Select value={weekday} onValueChange={setWeekday}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Button onClick={() => void add()} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
