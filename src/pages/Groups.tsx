import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WEEKDAYS } from "@/lib/groupRules";
import {
  GroupMember,
  GroupMessage,
  MealLock,
  ScheduleSlot,
  TrainerPackageOffer,
  WorkoutGroup,
  groupService,
} from "@/lib/groupService";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [groups, setGroups] = useState<WorkoutGroup[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = async () => {
    setSchemaMissing(false);
    try {
      const rows = await groupService.listMine();
      setGroups(rows);
      setSelected((current) => current ?? rows.find((row) => row.status === "joined")?.id ?? rows[0]?.id ?? null);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "";
      if (/workout_groups|schema cache|does not exist/i.test(message)) setSchemaMissing(true);
      else toast({ variant: "destructive", title: "Could not load groups", description: message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) void load(); }, [user?.id]);

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (schemaMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Group tables are not on the database yet</CardTitle>
          <CardDescription>Apply supabase/migrations/024_workout_groups.sql, then open this page again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const current = groups.find((row) => row.id === selected) ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black text-[#10233f]">Groups</h1>
        <p className="mt-1 text-sm text-muted-foreground">Invite friends, agree a workout time, lock a vendor meal plan, and pitch a trainer package.</p>
      </div>
      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Input placeholder="Group name" value={name} onChange={(event) => setName(event.target.value)} className="max-w-xs" />
          <Button onClick={async () => {
            try {
              const id = await groupService.create(name);
              setName("");
              await load();
              setSelected(id);
            } catch (err: unknown) {
              const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
              toast({ variant: "destructive", title: "Could not create the group", description: message });
            }
          }} disabled={!name.trim()}>Create group</Button>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Button key={group.id} size="sm" variant={group.id === selected ? "default" : "outline"} onClick={() => setSelected(group.id)}>
            {group.name}{group.status === "invited" ? " · invite" : ""}
          </Button>
        ))}
      </div>
      {current ? <GroupRoom group={current} onChanged={load} /> : <p className="text-sm text-muted-foreground">Create a group or accept an invite.</p>}
    </div>
  );
}

function GroupRoom({ group, onChanged }: { group: WorkoutGroup; onChanged: () => Promise<void> }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [locks, setLocks] = useState<MealLock[]>([]);
  const [plans, setPlans] = useState<Array<{ id: string; title: string; vendorName: string; priceNaira: number }>>([]);
  const [packages, setPackages] = useState<TrainerPackageOffer[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [progress, setProgress] = useState<Array<{ userId: string; name: string; sessions: number }>>([]);
  const [email, setEmail] = useState("");
  const [myEmail, setMyEmail] = useState<string | null>(user?.email?.toLowerCase() ?? null);
  const [weekday, setWeekday] = useState(1);
  const [time, setTime] = useState("18:00");
  const [draft, setDraft] = useState("");

  const refresh = async () => {
    const [memberRows, slotRows, lockRows, planRows, packageRows, messageRows, progressRows] = await Promise.all([
      groupService.members(group.id),
      groupService.schedule(group.id),
      groupService.mealLocks(group.id),
      groupService.publishedMealPlans(),
      groupService.packages(),
      groupService.messages(group.id),
      groupService.progress(group.id),
    ]);
    setMembers(memberRows);
    setSlots(slotRows);
    setLocks(lockRows);
    setPlans(planRows);
    setPackages(packageRows);
    setMessages(messageRows);
    setProgress(progressRows);
  };

  useEffect(() => { void refresh(); }, [group.id]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("email").eq("id", user.id).maybeSingle().then(({ data }) => {
      const profileEmail = typeof data?.email === "string" ? data.email.toLowerCase() : "";
      setMyEmail(profileEmail || user.email?.toLowerCase() || null);
    });
  }, [user?.id]);

  useEffect(() => {
    const channel = supabase.channel(`group-chat:${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${group.id}` }, (payload) => {
        const row = payload.new as { id: string; user_id: string; body: string; created_at: string };
        setMessages((current) => current.some((item) => item.id === row.id) ? current : [...current, {
          id: row.id, userId: row.user_id, body: row.body, createdAt: row.created_at,
        }]);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [group.id]);

  const joined = group.status === "joined";
  const inviteRow = members.find((member) => (
    member.status === "invited"
    && member.email
    && myEmail
    && member.email.toLowerCase() === myEmail
  ));
  const joinedCount = members.filter((member) => member.status === "joined").length;

  const fail = (title: string, err: unknown) => {
    const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
    toast({ variant: "destructive", title, description: message });
  };

  return (
    <div className="space-y-4">
      {!joined && inviteRow ? (
        <Button onClick={async () => {
          try { await groupService.accept(inviteRow.id); await onChanged(); } catch (err: unknown) { fail("Could not join", err); }
        }}>Join {group.name}</Button>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Friends</CardTitle>
          <CardDescription>{joinedCount} joined. An invite matches the email on their account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <p key={member.id} className="text-sm">{member.email || member.name} · {member.status}</p>
          ))}
          {joined ? (
            <div className="flex gap-2">
              <Input type="email" placeholder="friend@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Button variant="outline" onClick={async () => {
                try { await groupService.invite(group.id, email); setEmail(""); await refresh(); } catch (err: unknown) { fail("Could not invite", err); }
              }}>Invite</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout schedule</CardTitle>
          <CardDescription>A time locks when every joined member agrees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{WEEKDAYS[slot.weekday]} {slot.startTime} · {slot.label} · {slot.agreements}/{joinedCount} {slot.locked ? "· locked" : ""}</span>
              {joined && !slot.agreed ? <Button size="sm" variant="outline" onClick={async () => {
                try { await groupService.agreeSlot(slot.id); await refresh(); } catch (err: unknown) { fail("Could not agree", err); }
              }}>Agree</Button> : null}
            </div>
          ))}
          {joined ? (
            <div className="flex flex-wrap gap-2">
              <select className="rounded-md border bg-white px-2 text-sm" value={weekday} onChange={(event) => setWeekday(Number(event.target.value))}>
                {WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-32" />
              <Button size="sm" onClick={async () => {
                try { await groupService.proposeSlot(group.id, weekday, time, "Workout"); await refresh(); } catch (err: unknown) { fail("Could not add the time", err); }
              }}>Propose</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meal plan</CardTitle>
          <CardDescription>Lock a published vendor plan. The vendor sees it once every member has agreed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {locks.map((lock) => (
            <div key={lock.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{lock.title} · {lock.vendorName} · {lock.agreements}/{joinedCount} · {lock.status}</span>
              {joined && !lock.agreed && lock.status !== "locked" ? <Button size="sm" variant="outline" onClick={async () => {
                try { await groupService.agreeMeal(lock.id); await refresh(); } catch (err: unknown) { fail("Could not agree", err); }
              }}>Agree</Button> : null}
            </div>
          ))}
          {joined && plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{plan.title} · {plan.vendorName} · {naira(plan.priceNaira)}</span>
              <Button size="sm" variant="outline" onClick={async () => {
                try { await groupService.proposeMeal(group.id, plan.id); await refresh(); } catch (err: unknown) { fail("Could not propose the plan", err); }
              }}>Propose</Button>
            </div>
          ))}
          {plans.length === 0 ? <p className="text-sm text-muted-foreground">No vendor meal plan is published yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress this week</CardTitle>
          <CardDescription>Completed workouts from each joined member over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {progress.map((row) => <p key={row.userId} className="text-sm">{row.name} · {row.sessions} sessions</p>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trainer packages</CardTitle>
          <CardDescription>Pitch a monthly package. The trainer marks it booked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {packages.length === 0 ? <p className="text-sm text-muted-foreground">No monthly package is published yet.</p> : packages.map((pack) => (
            <div key={pack.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{pack.title} · {pack.trainerName} · {pack.months} mo · {pack.sessionsPerMonth}/mo · {naira(pack.priceNaira)}</span>
              {joined ? <Button size="sm" variant="outline" onClick={async () => {
                try {
                  await groupService.pitch(group.id, pack.id);
                  toast({ title: "Package pitched", description: `${pack.trainerName} can see it under Packages.` });
                } catch (err: unknown) { fail("Could not pitch the package", err); }
              }}>Pitch</Button> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Chat</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {messages.map((message) => (
              <p key={message.id} className="text-sm">
                <span className="text-muted-foreground">{message.userId === user?.id ? "You" : (members.find((member) => member.userId === message.userId)?.name || "Member")}: </span>
                {message.body}
              </p>
            ))}
          </div>
          {joined ? (
            <form className="flex gap-2" onSubmit={async (event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              try { await groupService.send(group.id, draft); setDraft(""); await refresh(); } catch (err: unknown) { fail("Could not send", err); }
            }}>
              <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message the group" />
              <Button type="submit">Send</Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
