import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { naira } from "@/lib/marketplaceService";

interface Client {
  user_id: string;
  name: string;
  sessions: number;
  paid: number;
  last_session: string | null;
}

/** Per-client booking history for a trainer. Backed by the trainer_clients() RPC. */
export function ClientRoster({ trainerId }: { trainerId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  const load = useCallback(async () => {
    if (!trainerId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.rpc("trainer_clients", { p_trainer: trainerId });
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }, [trainerId]);

  useEffect(() => { void load(); }, [load]);

  if (!trainerId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>Everyone who has booked you, most recent first.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <ul className="space-y-2">
            {clients.map((c) => (
              <li key={c.user_id} className="flex items-center justify-between gap-2 border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.sessions} session{c.sessions === 1 ? "" : "s"} · {naira(c.paid)} paid
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {c.last_session ? new Date(c.last_session).toLocaleDateString() : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
