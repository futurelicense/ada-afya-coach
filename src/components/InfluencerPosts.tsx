import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string | null;
  body: string;
  image_url: string | null;
  created_at: string;
}

/** Content an influencer publishes to their public page. Backed by influencer_posts. */
export function InfluencerPosts({ influencerId }: { influencerId: string | null }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!influencerId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("influencer_posts")
      .select("id, title, body, image_url, created_at")
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }, [influencerId]);

  useEffect(() => { void load(); }, [load]);

  const publish = async () => {
    if (!influencerId || !body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("influencer_posts").insert({
      influencer_id: influencerId,
      title: title.trim() || null,
      body: body.trim(),
      image_url: imageUrl.trim() || null,
    });
    setPosting(false);
    if (error) { toast({ variant: "destructive", title: error.message }); return; }
    setTitle(""); setBody(""); setImageUrl("");
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("influencer_posts").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: error.message });
    else setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (!influencerId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>Posts that appear on your public influencer page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 border rounded-lg p-3">
          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="What do you want to share?" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          <Input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Button onClick={() => void publish()} disabled={posting || !body.trim()}>
            {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Publish
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : posts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {p.title && <p className="font-medium text-sm">{p.title}</p>}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.body}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => void remove(p.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                {p.image_url && <img src={p.image_url} alt="" className="mt-2 rounded-md max-h-48 object-cover" />}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
