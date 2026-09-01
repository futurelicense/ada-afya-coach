import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface InquiryRow {
  id: string;
  type: string;
  listing_name: string;
  payload: Record<string, unknown>;
  status: "pending" | "contacted" | "closed";
  created_at: string;
}

const NEXT: Record<string, { to: InquiryRow["status"]; label: string } | undefined> = {
  pending:   { to: "contacted", label: "Mark contacted" },
  contacted: { to: "closed",    label: "Close" },
};

/** Non-paid "contact me" requests members send from Explore, for the listing this user owns. */
export function InquiryInbox({ listingId }: { listingId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InquiryRow[]>([]);

  const load = useCallback(async () => {
    if (!listingId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("id, type, listing_name, payload, status, created_at")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });
    setRows((data as InquiryRow[]) ?? []);
    setLoading(false);
  }, [listingId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!listingId) return;
    const ch = supabase
      .channel(`inbox-${listingId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries", filter: `listing_id=eq.${listingId}` }, (payload) => {
        if (payload.eventType === "INSERT") toast({ title: "New request" });
        void load();
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [listingId, load]);

  const advance = async (row: InquiryRow) => {
    const next = NEXT[row.status];
    if (!next) return;
    const { error } = await supabase.from("inquiries").update({ status: next.to }).eq("id", row.id);
    if (error) toast({ variant: "destructive", title: error.message });
    else void load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Inbox className="h-4 w-4" /> Requests</CardTitle>
        <CardDescription>Members who asked to be contacted (no payment yet).</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const contact = [row.payload?.name, row.payload?.phone, row.payload?.email, row.payload?.message]
                .filter(Boolean).join(" · ");
              const next = NEXT[row.status];
              return (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm capitalize">{row.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                      {contact ? ` · ${contact}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={row.status === "closed" ? "outline" : "secondary"}>{row.status}</Badge>
                    {next && (
                      <Button size="sm" variant="outline" onClick={() => void advance(row)}>{next.label}</Button>
                    )}
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
