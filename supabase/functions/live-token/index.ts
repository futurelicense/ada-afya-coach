import { RtcTokenBuilder, RtcRole } from 'npm:agora-token@2.0.5'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const APP_ID   = Deno.env.get('AGORA_APP_ID')          ?? ''
const APP_CERT = Deno.env.get('AGORA_APP_CERTIFICATE')  ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { profile } = await requireAuth(req)

    if (!APP_ID) {
      return new Response(JSON.stringify({ error: 'AGORA_APP_ID not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { channelName, role = 2 } = await req.json()
    if (!channelName) throw new Error('channelName is required')

    // role 1 = host (trainer / admin / elite), role 2 = audience
    if (role === 1) {
      const isHost = profile.role === 'trainer' || profile.role === 'admin' || profile.plan === 'elite'
      if (!isHost) throw Object.assign(new Error('Elite or Trainer plan required to go live'), { status: 403 })
    }

    const expire = 3600
    let token: string | null = null
    if (APP_CERT) {
      token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERT,
        channelName,
        0,                                                        // uid 0 = any
        role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
        expire,
        expire,
      )
    }
    // No cert configured → App-ID-only mode (token stays null; Agora project must allow it)

    return new Response(JSON.stringify({ token, appId: APP_ID, channelName, uid: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    return new Response(JSON.stringify({ error: err.message }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
