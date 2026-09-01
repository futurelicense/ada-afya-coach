import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CreatorProfile as Creator, fetchCreator, followInfluencer, unfollowInfluencer, isFollowing, bumpInfluencerView,
} from "@/lib/exploreService";
import { naira } from "@/lib/marketplaceService";

export default function CreatorProfile() {
  const { id = "" } = useParams();
  const { toast } = useToast();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const c = await fetchCreator(id);
    setCreator(c);
    if (c) { void bumpInfluencerView(c.id); setFollowing(await isFollowing(c.id)); }
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const toggleFollow = async () => {
    if (!creator) return;
    setBusy(true);
    try {
      if (following) { await unfollowInfluencer(creator.id); setFollowing(false); }
      else { await followInfluencer(creator.id); setFollowing(true); }
      setCreator((c) => c && { ...c, followers: c.followers + (following ? -1 : 1) });
    } catch (err) {
      toast({ variant: "destructive", title: err instanceof Error ? err.message : "Try again" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!creator) return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-3">
      <p className="text-muted-foreground">This creator page isn't available.</p>
      <Button asChild variant="outline"><Link to="/explore">Back to Explore</Link></Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Explore
      </Link>

      <div className="flex items-start gap-4">
        {creator.image
          ? <img src={creator.image} alt={creator.name} className="h-20 w-20 rounded-full object-cover" />
          : <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">{creator.name[0]}</div>}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{creator.name}</h1>
          <p className="text-sm text-muted-foreground">{creator.niche ?? "Fitness"} · {creator.platform}</p>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{creator.followers} followers</span>
            <Badge variant="outline">Partnerships from {naira(creator.rate)}</Badge>
          </div>
        </div>
        <Button onClick={() => void toggleFollow()} disabled={busy} variant={following ? "outline" : "default"}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : following ? "Following" : "Follow"}
        </Button>
      </div>

      {creator.bio && <p className="text-sm leading-relaxed">{creator.bio}</p>}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Posts</h2>
        {creator.posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : creator.posts.map((p) => (
          <Card key={p.id}>
            {p.title && <CardHeader className="pb-2"><CardTitle className="text-base">{p.title}</CardTitle></CardHeader>}
            <CardContent className={p.title ? "" : "pt-6"}>
              <p className="text-sm whitespace-pre-wrap">{p.body}</p>
              {p.image_url && <img src={p.image_url} alt="" className="mt-3 rounded-md max-h-72 object-cover" />}
              <p className="text-xs text-muted-foreground/70 mt-2">{new Date(p.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
