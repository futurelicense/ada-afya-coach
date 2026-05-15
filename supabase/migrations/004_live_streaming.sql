-- ─────────────────────────────────────────────────────
-- Phase 5: Live Streaming
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trainer_name     TEXT NOT NULL,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'HIIT',
  description      TEXT,
  agora_channel    TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','ended')),
  viewer_count     INTEGER DEFAULT 0,
  viewer_peak      INTEGER DEFAULT 0,
  thumbnail_gradient TEXT DEFAULT 'from-primary/50 to-secondary/50',
  started_at       TIMESTAMPTZ DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_sessions_status_idx ON public.live_sessions (status);
CREATE INDEX IF NOT EXISTS live_sessions_trainer_idx ON public.live_sessions (trainer_id);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Trainers can manage their own sessions
CREATE POLICY "live_sessions_trainer_all" ON public.live_sessions
  FOR ALL USING (auth.uid() = trainer_id);

-- Pro/Elite subscribers can read live sessions (and trainers/admins)
CREATE POLICY "live_sessions_premium_read" ON public.live_sessions
  FOR SELECT USING (
    status = 'live' AND (
      auth.uid() = trainer_id
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.status = 'active'
          AND s.plan IN ('pro','elite')
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('trainer','gym_owner','admin')
      )
    )
  );

-- Helper: increment viewer count atomically
CREATE OR REPLACE FUNCTION public.update_live_viewer_count(
  p_session_id UUID,
  p_delta      INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.live_sessions
     SET viewer_count = GREATEST(0, viewer_count + p_delta),
         viewer_peak  = GREATEST(viewer_peak, GREATEST(0, viewer_count + p_delta))
   WHERE id = p_session_id AND status = 'live';
END;
$$;


-- ── Live chat ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.live_chat (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username    TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_trainer  BOOLEAN DEFAULT false,
  sent_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_chat_session_idx ON public.live_chat (session_id, sent_at);

-- Enable Realtime for live chat
ALTER TABLE public.live_chat REPLICA IDENTITY FULL;

ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_chat_premium_read" ON public.live_chat
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND s.plan IN ('pro','elite')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('trainer','gym_owner','admin')
    )
  );

CREATE POLICY "live_chat_insert" ON public.live_chat
  FOR INSERT WITH CHECK (auth.uid() = user_id);
