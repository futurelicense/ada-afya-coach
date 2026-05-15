export type StreamCategory = 'HIIT' | 'Strength' | 'Cardio' | 'Yoga' | 'Stretching' | 'Dance Fitness';

export interface LiveSession {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  category: StreamCategory;
  description: string;
  startedAt: string;
  isLive: boolean;
  viewerCount: number;
  thumbnailGradient: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  username: string;
  message: string;
  sentAt: string;
  isTrainer?: boolean;
}

const SESSIONS_KEY = 'wefit_live_sessions';
const CHAT_KEY = 'wefit_live_chat';

const GRADIENTS = [
  'from-primary/80 to-secondary/80',
  'from-purple-600/80 to-pink-600/80',
  'from-orange-500/80 to-red-600/80',
  'from-teal-500/80 to-cyan-600/80',
  'from-green-500/80 to-emerald-600/80',
];

const SIMULATED_VIEWERS = [
  { username: 'Tunde_Fit', messages: ['Let\'s go! 🔥', 'This is fire!', 'Great form coach!', 'How many reps?'] },
  { username: 'Ngozi_Wellness', messages: ['Love this workout!', 'Feeling the burn 💪', 'Day 3 done!', 'Amazing session!'] },
  { username: 'AbujaBoy', messages: ['Coach you too much! 😅', 'My legs 😭', 'Best trainer ever', 'Let\'s goooo!'] },
  { username: 'LagosQueen', messages: ['Finally made it live!', 'This is what I needed', 'Sweating already 😂', 'More please!'] },
  { username: 'FitNaija247', messages: ['Tuning in from PH!', 'Consistent is key!', 'Oya let\'s go!', '💯💯💯'] },
];

class LiveStreamService {
  getSessions(): LiveSession[] {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getLiveSessions(): LiveSession[] {
    return this.getSessions().filter(s => s.isLive);
  }

  startSession(params: { trainerId: string; trainerName: string; title: string; category: StreamCategory; description: string }): LiveSession {
    const sessions = this.getSessions().filter(s => s.trainerId !== params.trainerId);
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    const session: LiveSession = {
      id: `live_${Date.now()}`,
      ...params,
      startedAt: new Date().toISOString(),
      isLive: true,
      viewerCount: Math.floor(Math.random() * 15) + 3,
      thumbnailGradient: gradient,
    };
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return session;
  }

  endSession(sessionId: string): void {
    const sessions = this.getSessions().map(s =>
      s.id === sessionId ? { ...s, isLive: false } : s
    );
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  updateViewerCount(sessionId: string, delta: number): void {
    const sessions = this.getSessions().map(s =>
      s.id === sessionId ? { ...s, viewerCount: Math.max(0, s.viewerCount + delta) } : s
    );
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  getSessionById(id: string): LiveSession | null {
    return this.getSessions().find(s => s.id === id) ?? null;
  }

  getTrainerActiveSession(trainerId: string): LiveSession | null {
    return this.getLiveSessions().find(s => s.trainerId === trainerId) ?? null;
  }

  getChat(sessionId: string): ChatMessage[] {
    const data = localStorage.getItem(`${CHAT_KEY}_${sessionId}`);
    return data ? JSON.parse(data) : [];
  }

  sendMessage(sessionId: string, username: string, message: string, isTrainer = false): ChatMessage {
    const msgs = this.getChat(sessionId);
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sessionId,
      username,
      message,
      sentAt: new Date().toISOString(),
      isTrainer,
    };
    msgs.push(msg);
    localStorage.setItem(`${CHAT_KEY}_${sessionId}`, JSON.stringify(msgs));
    return msg;
  }

  simulateViewerMessage(sessionId: string): ChatMessage | null {
    const viewer = SIMULATED_VIEWERS[Math.floor(Math.random() * SIMULATED_VIEWERS.length)];
    const message = viewer.messages[Math.floor(Math.random() * viewer.messages.length)];
    return this.sendMessage(sessionId, viewer.username, message);
  }

  getDuration(startedAt: string): string {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

export const liveStreamService = new LiveStreamService();
