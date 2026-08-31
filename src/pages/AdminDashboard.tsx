import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { naira } from "@/lib/marketplaceService";
import type { UserRole } from "@/lib/userDataService";

const ROLES: UserRole[] = ["user", "vendor", "trainer", "gym_owner", "influencer", "admin"];

/* ── Overview ─────────────────────────────────────────── */
function Overview() {
  const [data, setData] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    void supabase.rpc("admin_overview").then(({ data }) => setData((data as Record<string, number>) ?? {}));
  }, []);
  if (!data) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  const cards: [string, string][] = [
    ["Members", String(data.members ?? 0)],
    ["Pro / Elite", `${data.pro ?? 0} / ${data.elite ?? 0}`],
    ["Open requests", String(data.open_inquiries ?? 0)],
    ["GMV", naira(data.gmv_naira ?? 0)],
    ["Vendors", String(data.vendors ?? 0)],
    ["Trainers", String(data.trainers ?? 0)],
    ["Gyms", String(data.gyms ?? 0)],
    ["Influencers", String(data.influencers ?? 0)],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <Card key={label}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Inquiries ────────────────────────────────────────── */
interface Inq { id: string; type: string; listing_name: string; status: string; created_at: string; }
function Inquiries() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Inq[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("inquiries").select("id, type, listing_name, status, created_at").order("created_at", { ascending: false }).limit(200);
    setRows((data as Inq[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message }); else void load();
  };
  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">No inquiries.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
          <div>
            <p className="font-medium text-sm capitalize">{r.type.replace(/_/g, " ")} — {r.listing_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={r.status === "closed" ? "outline" : "secondary"}>{r.status}</Badge>
            {r.status !== "closed" && (
              <Button size="sm" variant="outline" onClick={() => void setStatus(r.id, "closed")}>Close</Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Listings moderation ──────────────────────────────── */
const LISTING_TABLES: { table: string; label: string }[] = [
  { table: "vendors", label: "Vendors" },
  { table: "public_trainers", label: "Trainers" },
  { table: "gyms", label: "Gyms" },
  { table: "influencers", label: "Influencers" },
];
function Listings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("vendors");
  const [rows, setRows] = useState<{ id: string; name: string; published: boolean | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async (table: string) => {
    setLoading(true);
    const { data } = await supabase.from(table).select("id, name, published").order("created_at", { ascending: false });
    setRows((data as { id: string; name: string; published: boolean | null }[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(tab); }, [tab, load]);
  const toggle = async (id: string, published: boolean) => {
    const { error } = await supabase.from(tab).update({ published }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setRows((prev) => prev.map((r) => (r.id === id ? { ...r, published } : r)));
  };
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        {LISTING_TABLES.map((t) => <TabsTrigger key={t.table} value={t.table}>{t.label}</TabsTrigger>)}
      </TabsList>
      {LISTING_TABLES.map((t) => (
        <TabsContent key={t.table} value={t.table}>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 border rounded-lg p-3">
                  <p className="font-medium text-sm">{r.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{r.published === false ? "hidden" : "published"}</span>
                    <Switch checked={r.published !== false} onCheckedChange={(v) => void toggle(r.id, v)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/* ── Users ────────────────────────────────────────────── */
interface Prof { id: string; name: string | null; email: string | null; role: UserRole; plan: string; }
function Users() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Prof[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id, name, email, role, plan").order("created_at", { ascending: false }).limit(500);
    setRows((data as Prof[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const setRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else { setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r))); toast({ title: "Role updated" }); }
  };
  const filtered = rows.filter((r) =>
    !q || (r.name ?? "").toLowerCase().includes(q.toLowerCase()) || (r.email ?? "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm">{r.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{r.email} · {r.plan}</p>
              </div>
              <Select value={r.role} onValueChange={(v) => void setRole(r.id, v as UserRole)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Challenges ───────────────────────────────────────── */
interface Ch { id: string; title: string; type: string; target_value: number; is_active: boolean; ends_at: string; }
function Challenges() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Ch[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("workouts");
  const [target, setTarget] = useState("30");
  const [days, setDays] = useState("30");
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("community_challenges").select("id, title, type, target_value, is_active, ends_at").order("created_at", { ascending: false });
    setRows((data as Ch[]) ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const create = async () => {
    if (!title.trim()) return;
    const ends = new Date(Date.now() + Number(days) * 86400000).toISOString();
    const { error } = await supabase.from("community_challenges").insert({
      title: title.trim(), type, target_value: Number(target) || 1, target_unit: type === "calories" ? "kcal" : "days",
      description: title.trim(), ends_at: ends, is_active: true,
    });
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    setTitle(""); void load();
  };
  const toggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("community_challenges").update({ is_active }).eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active } : r)));
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_130px_90px_90px_auto] items-end border rounded-lg p-3">
        <Input placeholder="Challenge title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["workouts", "calories", "streak", "water", "steps"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input inputMode="numeric" placeholder="target" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Input inputMode="numeric" placeholder="days" value={days} onChange={(e) => setDays(e.target.value)} />
        <Button onClick={() => void create()} disabled={!title.trim()}>Create</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
              <div>
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.type} · target {r.target_value} · ends {new Date(r.ends_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.is_active ? "active" : "off"}</span>
                <Switch checked={r.is_active} onCheckedChange={(v) => void toggle(r.id, v)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
const AdminDashboard = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-4xl font-bold text-gradient mb-2">Admin</h1>
      <p className="text-muted-foreground">Platform overview, moderation, and user management.</p>
    </div>
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="challenges">Challenges</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><Overview /></TabsContent>
      <TabsContent value="inquiries"><Inquiries /></TabsContent>
      <TabsContent value="listings"><Listings /></TabsContent>
      <TabsContent value="users"><Users /></TabsContent>
      <TabsContent value="challenges"><Challenges /></TabsContent>
    </Tabs>
  </div>
);

export default AdminDashboard;
