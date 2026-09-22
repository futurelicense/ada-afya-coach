import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Share2, DollarSign, Loader2, Sparkles } from "lucide-react";
import { ListingEditor } from "@/components/ListingEditor";
import { InquiryInbox } from "@/components/InquiryInbox";
import { InfluencerPosts } from "@/components/InfluencerPosts";
import { FollowerList } from "@/components/FollowerList";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessStats } from "@/hooks/useBusinessStats";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ROLE_THEME } from "@/lib/roleTheme";

const PIPELINE_STAGES = ["pending", "paid", "accepted", "declined"] as const;

function PartnershipPipeline({ rows }: { rows: { status: string }[] }) {
  const counts = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, rows.filter((r) => r.status === s).length]));
  return (
    <Card className={ROLE_THEME.influencer.border}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className={`h-4 w-4 ${ROLE_THEME.influencer.icon}`} /> Partnership pipeline
        </CardTitle>
        <CardDescription>Where brand requests stand right now.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map((stage) => (
          <Badge key={stage} variant="outline" className="text-sm py-1.5 px-3">
            {counts[stage]} {stage}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

interface LatestPost { id: string; title: string | null; body: string; created_at: string; }

function useLatestPost(influencerId: string | null) {
  const [post, setPost] = useState<LatestPost | null>(null);
  useEffect(() => {
    if (!influencerId) { setPost(null); return; }
    supabase.from("influencer_posts")
      .select("id, title, body, created_at")
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setPost((data?.[0] as LatestPost) ?? null));
  }, [influencerId]);
  return post;
}

function LatestPostCard({ influencerId }: { influencerId: string | null }) {
  const post = useLatestPost(influencerId);
  return (
    <Card className={ROLE_THEME.influencer.border}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className={`h-4 w-4 ${ROLE_THEME.influencer.icon}`} /> Latest content
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {post ? (
          <div className="min-w-0">
            {post.title && <p className="text-sm font-medium">{post.title}</p>}
            <p className="text-xs text-muted-foreground truncate max-w-md">{post.body}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>
        )}
        <Button asChild size="sm" variant="outline">
          <Link to="/influencer/content">{post ? "Post again" : "Create a post"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const HEADINGS: Record<string, { title: string; sub: string }> = {
  home:         { title: "Influencer Hub",  sub: "Followers, views and paid brand partnerships." },
  content:      { title: "Content",         sub: "Posts on your public influencer page." },
  followers:    { title: "Followers",       sub: "Members following you on WeFit." },
  partnerships: { title: "Partnerships",    sub: "Brands pay your listed rate on Explore." },
  listing:      { title: "Public listing",  sub: "What brands and members see on Explore." },
  requests:     { title: "Requests",        sub: "People who asked to be contacted." },
};

export default function InfluencerWorkspace() {
  const { section = "home" } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = useBusinessStats("influencer", user?.id);
  const head = HEADINGS[section] ?? HEADINGS.home;

  const accept = async (id: string) => {
    const { error } = await supabase.rpc("transition_marketplace_record", {
      p_kind: "partnership",
      p_record_id: id,
      p_new_status: "accepted",
    });
    if (error) toast({ variant: "destructive", title: error.message });
    else await stats.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">{head.title}</h1>
        <p className="text-muted-foreground">{head.sub}</p>
      </div>

      {section === "home" && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Followers", value: stats.loading ? "…" : String(stats.countA), icon: Users },
              { label: "Profile views", value: stats.loading ? "…" : String(stats.countB), icon: Eye },
              { label: "Partnerships", value: stats.rating, icon: Share2 },
              { label: "Revenue (paid)", value: stats.loading ? "…" : naira(stats.revenue), icon: DollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className={ROLE_THEME.influencer.border}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <div className={`h-7 w-7 rounded-lg ${ROLE_THEME.influencer.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${ROLE_THEME.influencer.icon}`} />
                  </div>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <PartnershipPipeline rows={stats.rows} />
            <LatestPostCard influencerId={stats.listingId} />
          </div>
          <PartnershipList rows={stats.rows} loading={stats.loading} accept={accept} limit={5} />
        </>
      )}

      {section === "content" && <InfluencerPosts influencerId={stats.listingId} />}
      {section === "followers" && <FollowerList influencerId={stats.listingId} />}
      {section === "partnerships" && <PartnershipList rows={stats.rows} loading={stats.loading} accept={accept} />}
      {section === "listing" && user?.id && <ListingEditor kind="influencer" userId={user.id} />}
      {section === "requests" && <InquiryInbox listingId={stats.listingId} />}
    </div>
  );
}

function PartnershipList({
  rows, loading, accept, limit,
}: {
  rows: { id: string; label: string; amount: number; status: string; when: string }[];
  loading: boolean;
  accept: (id: string) => void;
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <Card>
      <CardHeader><CardTitle>Partnerships</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <EmptyState icon={Share2} title="No partnerships yet" description="Brand partnership requests paid on Explore will land here." />
        ) : (
          <ul className="space-y-3">
            {shown.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{new Date(row.when).toLocaleString()} · {naira(row.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{row.status}</Badge>
                  {row.status === "paid" && (
                    <Button size="sm" variant="outline" onClick={() => accept(row.id)}>Accept</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
