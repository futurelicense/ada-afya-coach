import { useState, useRef, useEffect, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, VideoOff, Mic, MicOff, Users, Send, Radio, StopCircle, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
const CATEGORIES = ['HIIT', 'Strength', 'Cardio', 'Yoga', 'Stretching', 'Dance Fitness'] as const
type Category = typeof CATEGORIES[number]

interface ChatMsg { id: string; username: string; message: string; is_trainer: boolean; sent_at: string }
interface Props { trainerId: string; trainerName: string }

export function LiveStreamStudio({ trainerId, trainerName }: Props) {
  const { session } = useAuth();
  const { toast }   = useToast();

  const videoRef   = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const clientRef  = useRef<IAgoraRTCClient | null>(null);
  const audioRef   = useRef<IMicrophoneAudioTrack | null>(null);
  const cameraRef  = useRef<ICameraVideoTrack | null>(null);

  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [channelName,setChannelName]= useState<string>('');
  const [title,      setTitle]      = useState("Morning Workout Session");
  const [category,   setCategory]   = useState<Category>("HIIT");
  const [description,setDescription]= useState("Let's crush it together! Full body workout for all levels.");
  const [cameraOn,   setCameraOn]   = useState(false);
  const [micOn,      setMicOn]      = useState(true);
  const [chatMsg,    setChatMsg]     = useState("");
  const [chat,       setChat]        = useState<ChatMsg[]>([]);
  const [duration,   setDuration]    = useState("00:00");
  const [viewers,    setViewers]     = useState(0);
  const [cameraError,setCameraError] = useState(false);
  const [isLive,     setIsLive]      = useState(false);
  const [startedAt,  setStartedAt]   = useState<Date | null>(null);

  // Duration ticker
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setDuration(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  // Supabase Realtime — chat subscription
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`live_chat:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `session_id=eq.${sessionId}` },
        payload => setChat(prev => [...prev, payload.new as ChatMsg]),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Supabase Realtime — viewer count
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`live_session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionId}` },
        payload => setViewers((payload.new as any).viewer_count ?? 0),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ── Camera preview (no Agora needed) ──────────────
  async function startCamera() {
    try {
      const track = await AgoraRTC.createCameraVideoTrack();
      cameraRef.current = track;
      if (videoRef.current) track.play(videoRef.current);
      setCameraOn(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
      toast({ title: "Camera access denied", variant: "destructive" });
    }
  }

  function stopCamera() {
    cameraRef.current?.stop();
    cameraRef.current?.close();
    cameraRef.current = null;
    setCameraOn(false);
  }

  function toggleMic() {
    if (audioRef.current) audioRef.current.setEnabled(micOn ? false : true);
    setMicOn(v => !v);
  }

  // ── Go Live ────────────────────────────────────────
  async function goLive() {
    if (!title.trim()) { toast({ title: "Add a stream title", variant: "destructive" }); return; }
    if (!session) { toast({ title: "Sign in required", variant: "destructive" }); return; }

    const channel = `wefit-live-${crypto.randomUUID().slice(0, 8)}`;

    // 1. Get Agora token
    const tokenRes = await fetch(`${FUNCTIONS_URL}/live-token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName: channel, role: 1 }),
    });
    const { token, appId, uid = 0, error: tokenErr } = await tokenRes.json();
    if (tokenErr || !appId) { toast({ title: tokenErr || "Live streaming isn't configured yet", variant: "destructive" }); return; }

    // 2. Create session in Supabase
    const { data: sess, error: dbErr } = await supabase.from('live_sessions').insert({
      trainer_id:   trainerId,
      trainer_name: trainerName,
      title,
      category,
      description,
      agora_channel: channel,
      status:        'live',
    }).select('id').single();
    if (dbErr || !sess) { toast({ title: "Failed to start session", variant: "destructive" }); return; }

    // 3. Join Agora channel
    const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
    clientRef.current = client;
    await client.setClientRole('host');
    await client.join(appId, channel, token ?? null, uid);

    // 4. Create + publish audio track
    const audio = await AgoraRTC.createMicrophoneAudioTrack();
    audioRef.current = audio;

    // Reuse existing camera track or create one
    if (!cameraRef.current) {
      const cam = await AgoraRTC.createCameraVideoTrack();
      cameraRef.current = cam;
    }
    if (videoRef.current) cameraRef.current.play(videoRef.current);
    await client.publish([audio, cameraRef.current]);
    setCameraOn(true);

    setSessionId(sess.id);
    setChannelName(channel);
    setIsLive(true);
    setStartedAt(new Date());
    setChat([]);
    toast({ title: "You're LIVE! 🔴", description: "Your session is now visible to premium members." });
  }

  // ── End stream ─────────────────────────────────────
  async function endStream() {
    // Supabase update
    if (sessionId) {
      await supabase.from('live_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId);
    }

    // Leave Agora
    audioRef.current?.stop(); audioRef.current?.close(); audioRef.current = null;
    stopCamera();
    await clientRef.current?.leave();
    clientRef.current = null;

    setIsLive(false);
    setSessionId(null);
    setChannelName('');
    setStartedAt(null);
    setDuration('00:00');
    setChat([]);
    toast({ title: "Stream ended", description: "Your live session has been saved." });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.stop(); audioRef.current?.close();
      cameraRef.current?.stop(); cameraRef.current?.close();
      clientRef.current?.leave();
    };
  }, []);

  async function sendChat() {
    if (!chatMsg.trim() || !sessionId || !session) return;
    await supabase.from('live_chat').insert({
      session_id: sessionId,
      user_id:    session.user.id,
      username:   trainerName,
      message:    chatMsg.trim(),
      is_trainer: true,
    });
    setChatMsg('');
  }

  // ─── Pre-live setup UI ─────────────────────────────
  if (!isLive) {
    return (
      <Card className="glass border-0 shadow-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Radio className="h-6 w-6 text-primary" />
            Go Live
          </CardTitle>
          <p className="text-muted-foreground text-sm">Set up your live workout session for premium members</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted/50 flex items-center justify-center border border-border/50">
            <div ref={videoRef} className={cn("w-full h-full", !cameraOn && "hidden")} />
            {!cameraOn && (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Camera className="h-12 w-12 opacity-30" />
                <span className="text-sm">{cameraError ? "Camera unavailable" : "Camera preview will appear here"}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant={cameraOn ? "destructive" : "outline"} className="flex-1 gap-2" onClick={cameraOn ? stopCamera : startCamera}>
              {cameraOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {cameraOn ? "Stop Preview" : "Preview Camera"}
            </Button>
            {cameraOn && (
              <Button variant={micOn ? "outline" : "destructive"} className="gap-2" onClick={toggleMic}>
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stream Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Morning HIIT Blast" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell viewers what to expect..." rows={2} />
            </div>
          </div>

          <Button className="w-full gap-2 shadow-glow text-base h-12" onClick={goLive}>
            <Radio className="h-5 w-5" />
            Go Live Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Live studio UI ────────────────────────────────
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="glass border-0 shadow-premium overflow-hidden">
          <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30">
            <div ref={videoRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-red-500 text-white border-0 gap-1.5 px-3 py-1.5 text-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white inline-block" /> LIVE
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
                <p className="text-white font-semibold truncate">{title}</p>
                <p className="text-white/70 text-xs">{category} • by {trainerName}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4 flex gap-3 flex-wrap">
            <Button variant={cameraOn ? "outline" : "secondary"} size="sm" className="gap-2" onClick={cameraOn ? stopCamera : startCamera}>
              {cameraOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {cameraOn ? "Cam Off" : "Cam On"}
            </Button>
            <Button variant={micOn ? "outline" : "secondary"} size="sm" className="gap-2" onClick={toggleMic}>
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {micOn ? "Mute" : "Unmute"}
            </Button>
            <Button variant="destructive" size="sm" className="gap-2 ml-auto" onClick={endStream}>
              <StopCircle className="h-4 w-4" /> End Stream
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Watching Now", value: viewers }, { label: "Duration", value: duration }, { label: "Category", value: category }]
            .map(s => (
              <Card key={s.label} className="glass border-0 p-4 text-center">
                <div className="text-xl font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
        </div>
      </div>

      <Card className="glass border-0 shadow-card flex flex-col h-[520px]">
        <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            Live Chat
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">{chat.length} messages</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {chat.length === 0 && <p className="text-muted-foreground text-xs text-center pt-8">Chat will appear once viewers join</p>}
          {chat.map(msg => (
            <div key={msg.id} className={cn("rounded-xl p-2.5 text-sm", msg.is_trainer ? "bg-primary/10 border border-primary/20" : "bg-muted/50")}>
              <span className={cn("font-semibold text-xs mr-1.5", msg.is_trainer ? "text-primary" : "text-secondary")}>
                {msg.is_trainer ? `${msg.username} (You)` : msg.username}
              </span>
              <span className="text-foreground/80">{msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </CardContent>
        <div className="p-3 border-t border-border/50 flex-shrink-0">
          <div className="flex gap-2">
            <Input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Say something..." className="text-sm"
              onKeyDown={e => e.key === 'Enter' && sendChat()} />
            <Button size="sm" onClick={sendChat} className="px-3"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
