import { RtcTokenBuilder, RtcRole } from 'npm:agora-token@2.0.5'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const APP_ID   = Deno.env.get('AGORA_APP_ID')          ?? ''
const APP_CERT = Deno.env.get('AGORA_APP_CERTIFICATE')  ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)

    if (!APP_ID || !APP_CERT) {
      return new Response(JSON.stringify({ error: 'Secure live streaming is not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sessionId, role } = await req.json() as {
      sessionId?: string
      role?: 'host' | 'audience'
    }
    if (!sessionId || !['host', 'audience'].includes(role ?? '')) {
      throw Object.assign(new Error('sessionId and a valid role are required'), { status: 400 })
    }

    const { data: liveSession, error: sessionError } = await supabase
      .from('live_sessions')
      .select('id, trainer_id, agora_channel, status')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError || !liveSession || liveSession.status !== 'live') {
      throw Object.assign(new Error('Live session is unavailable'), { status: 404 })
    }

    if (role === 'host') {
      if (liveSession.trainer_id !== userId || !['trainer', 'admin'].includes(profile.role)) {
        throw Object.assign(new Error('Only the session owner can broadcast'), { status: 403 })
      }
    } else {
      const isOwnerOrAdmin = liveSession.trainer_id === userId || profile.role === 'admin'
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .in('plan', ['pro', 'elite'])
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
        .limit(1)
        .maybeSingle()
      if (!isOwnerOrAdmin && !subscription) {
        throw Object.assign(new Error('An active Pro or Elite plan is required'), { status: 403 })
      }
    }

    const expire = 3600
    const uid = stableAgoraUid(userId)
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERT,
      liveSession.agora_channel,
      uid,
      role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
      expire,
      expire,
    )

    return new Response(JSON.stringify({
      token,
      appId: APP_ID,
      channelName: liveSession.agora_channel,
      uid,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    return new Response(JSON.stringify({ error: err.message }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function stableAgoraUid(userId: string): number {
  const hex = userId.replaceAll('-', '').slice(0, 8)
  const value = Number.parseInt(hex, 16) >>> 0
  return value === 0 ? 1 : value
}
