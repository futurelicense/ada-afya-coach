import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Send, Crown, Radio, ArrowLeft, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

interface LiveSession {
  id: string; trainer_name: string; title: string; category: string;
  description: string; agora_channel: string; viewer_count: number; started_at: string;
}
interface ChatMsg { id: string; username: string; message: string; is_trainer: boolean; sent_at: string }

type Plan = 'free' | 'pro' | 'elite';
interface Props { userPlan: Plan; username?: string }

export function LiveStreamViewer({ userPlan, username = "You" }: Props) {
  const navigate   = useNavigate();
  const { session } = useAuth();
  const videoRef   = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const clientRef  = useRef<IAgoraRTCClient | null>(null);

  const [sessions,  setSessions]  = useState<LiveSession[]>([]);
  const [watching,  setWatching]  = useState<LiveSession | null>(null);
  const [chat,      setChat]      = useState<ChatMsg[]>([]);
  const [chatMsg,   setChatMsg]   = useState('');
  const [duration,  setDuration]  = useState('00:00');
  const [viewers,   setViewers]   = useState(0);
  const [joining,   setJoining]   = useState(false);

  const isPremium = userPlan === 'pro' || userPlan === 'elite';

  // ── Fetch live sessions ────────────────────────────
  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from('live_sessions')
      .select('id,trainer_name,title,category,description,agora_channel,viewer_count,started_at')
      .eq('status', 'live')
      .order('started_at', { ascending: false });
    setSessions(data ?? []);
  }, []);

  useEffect(() => {
    if (!isPremium) return;
    fetchSessions();
    const timer = setInterval(fetchSessions, 10_000);
    return () => clearInterval(timer);
  }, [isPremium, fetchSessions]);

  // ── Duration ticker ────────────────────────────────
  useEffect(() => {
    if (!watching) return;
    const startMs = new Date(watching.started_at).getTime();
    const id = setInterval(() => {
      const diff = Math.floor((Date.now() - startMs) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setDuration(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(id);
  }, [watching]);

  // ── Chat realtime subscription ─────────────────────
  useEffect(() => {
    if (!watching) return;
    const channel = supabase
      .channel(`live_chat:viewer:${watching.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `session_id=eq.${watching.id}` },
        payload => {
          setChat(prev => [...prev, payload.new as ChatMsg]);
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [watching]);

  // ── Viewer count realtime ──────────────────────────
  useEffect(() => {
    if (!watching) return;
    const channel = supabase
      .channel(`live_session:viewer:${watching.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${watching.id}` },
        payload => {
          const s = payload.new as any;
          if (s.status === 'ended') { leaveSession(); return; }
          setViewers(s.viewer_count ?? 0);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [watching]);

  // ── Join session ───────────────────────────────────
  async function joinSession(sess: LiveSession) {
    if (!session) return;
    setJoining(true);
    try {
      const tokenRes = await fetch(`${FUNCTIONS_URL}/live-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: sess.agora_channel, role: 2 }),
      });
      const { token, appId, error: tokenErr } = await tokenRes.json();
      if (tokenErr) throw new Error(tokenErr);

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
      clientRef.current = client;
      await client.setClientRole('audience');

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video' && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', async (user: IAgoraRTCRemoteUser, mediaType) => {
        await client.unsubscribe(user, mediaType);
      });

      await client.join(appId, sess.agora_channel, token, null);

      // Increment viewer count in Supabase
      await supabase.rpc('update_live_viewer_count', { p_session_id: sess.id, p_delta: 1 });

      // Load last 30 chat messages
      const { data: history } = await supabase
        .from('live_chat')
        .select('*')
        .eq('session_id', sess.id)
        .order('sent_at', { ascending: true })
        .limit(30);

      setWatching(sess);
      setViewers(sess.viewer_count + 1);
      setChat(history ?? []);
      setDuration('00:00');
    } catch (err: any) {
      console.error('Failed to join session', err);
    } finally {
      setJoining(false);
    }
  }

  // ── Leave session ──────────────────────────────────
  async function leaveSession() {
    if (watching) {
      await supabase.rpc('update_live_viewer_count', { p_session_id: watching.id, p_delta: -1 });
    }
    await clientRef.current?.leave();
    clientRef.current = null;
    setWatching(null);
    setChat([]);
    fetchSessions();
  }

  useEffect(() => () => { clientRef.current?.leave(); }, []);

  async function sendChat() {
    if (!chatMsg.trim() || !watching || !session) return;
    await supabase.from('live_chat').insert({
      session_id: watching.id,
      user_id:    session.user.id,
      username:   username,
      message:    chatMsg.trim(),
      is_trainer: false,
    });
    setChatMsg('');
  }

  // ── Paywall ────────────────────────────────────────
  if (!isPremium) {
    return (
      <Card className="glass border-0 shadow-premium overflow-hidden">
        <CardContent className="relative p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Live Workouts — Premium Feature</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Watch live workout sessions from certified Nigerian trainers in real time. Available on Pro and Elite plans.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            {["Watch trainer live sessions", "Real-time workout guidance", "Live chat with your coach", "Unlimited replays"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                {f}
              </div>
            ))}
          </div>
          <Button className="gap-2 shadow-glow" onClick={() => navigate("/pricing")}>
            <Zap className="h-4 w-4" />
            Upgrade to Pro — ₦2,500/mo
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Watching a session ─────────────────────────────
  if (watching) {
    return (
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass border-0 shadow-premium overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30">
              <div ref={videoRef} className="w-full h-full" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-red-500 text-white border-0 gap-1.5 px-3 py-1.5 text-sm">
                  <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" /> LIVE
                </Badge>
                <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">{duration}</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm gap-1.5">
                  <Users className="h-3 w-3" /> {viewers} watching
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-white font-semibold truncate">{watching.title}</p>
                  <p className="text-white/70 text-xs">{watching.category} • {watching.trainer_name}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <Button variant="outline" size="sm" className="gap-2" onClick={leaveSession}>
                <ArrowLeft className="h-4 w-4" /> Leave session
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-lg">{watching.title}</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20">{watching.category}</Badge>
              <p className="text-muted-foreground text-sm">{watching.description}</p>
              <p className="text-xs text-muted-foreground">Trainer: {watching.trainer_name}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-0 shadow-card flex flex-col h-[520px]">
          <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              Live Chat
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs animate-pulse">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {chat.length === 0 && <p className="text-muted-foreground text-xs text-center pt-8">No messages yet — say hi!</p>}
            {chat.map(msg => (
              <div key={msg.id} className={cn(
                "rounded-xl p-2.5 text-sm",
                msg.is_trainer ? "bg-primary/10 border border-primary/20" : "bg-muted/50",
                msg.username === username && "bg-secondary/10 border border-secondary/20",
              )}>
                <span className={cn("font-semibold text-xs mr-1.5", msg.is_trainer ? "text-primary" : "text-secondary")}>
                  {msg.is_trainer ? `${msg.username} (Trainer)` : msg.username}
                </span>
                <span className="text-foreground/80">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </CardContent>
          <div className="p-3 border-t border-border/50 flex-shrink-0">
            <div className="flex gap-2">
              <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Join the chat..." className="text-sm"
                onKeyDown={e => e.key === 'Enter' && sendChat()} />
              <Button size="sm" onClick={sendChat} className="px-3"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Session browser ────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Now</h3>
          <p className="text-sm text-muted-foreground">Watch certified trainers in real time</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
          <Crown className="h-3 w-3" />
          {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Member
        </Badge>
      </div>

      {sessions.length === 0 ? (
        <Card className="glass border-0">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Radio className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium mb-1">No live sessions right now</p>
            <p className="text-sm text-muted-foreground">Check back soon — trainers go live daily at 6AM, 9AM, 12PM & 7PM</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(sess => (
            <Card key={sess.id} className="glass border-0 shadow-card hover:shadow-premium transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 relative flex items-center justify-center">
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white border-0 gap-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" /> LIVE
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm gap-1 text-xs">
                    <Users className="h-2.5 w-2.5" /> {sess.viewer_count}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm line-clamp-1">{sess.title}</p>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0">{sess.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{sess.trainer_name}</p>
                <Button size="sm" className="w-full gap-2 shadow-glow" disabled={joining} onClick={() => joinSession(sess)}>
                  {joining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Join Live
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
