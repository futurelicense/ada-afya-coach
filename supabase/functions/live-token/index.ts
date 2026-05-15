import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const APP_ID   = Deno.env.get('AGORA_APP_ID')          ?? ''
const APP_CERT = Deno.env.get('AGORA_APP_CERTIFICATE')  ?? ''

// ─── Agora AccessToken v006 generator (pure Web Crypto API) ────────────

const enc = new TextEncoder()

function pu16(v: number): Uint8Array {
  const b = new ArrayBuffer(2); new DataView(b).setUint16(0, v, false); return new Uint8Array(b)
}
function pu32(v: number): Uint8Array {
  const b = new ArrayBuffer(4); new DataView(b).setUint32(0, v, false); return new Uint8Array(b)
}
function pbytestr(b: Uint8Array): Uint8Array {
  return new Uint8Array([...pu16(b.length), ...b])
}
function pmap(entries: [number, number][]): Uint8Array {
  const sorted = [...entries].sort((a, b) => a[0] - b[0])
  const body = sorted.flatMap(([k, v]) => [...pu16(k), ...pu32(v)])
  return new Uint8Array([...pu16(sorted.length), ...body])
}
function concat(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((s, a) => s + a.length, 0)
  const r = new Uint8Array(len)
  let off = 0
  for (const a of arrays) { r.set(a, off); off += a.length }
  return r
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const cs     = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  await writer.write(data)
  await writer.close()
  const chunks: Uint8Array[] = []
  const reader = cs.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return concat(...chunks)
}

function toB64(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
}

/**
 * Generate an Agora RTC token (v006 format).
 * role 1 = publisher/host (trainer), role 2 = subscriber/audience (viewer)
 */
async function generateRtcToken(
  channel:    string,
  uid:        number,
  role:       1 | 2,
  expireSecs: number,
): Promise<string> {
  const ts     = Math.floor(Date.now() / 1000)
  const salt   = Math.floor(Math.random() * 0xFFFF_FFFF)
  const expire = ts + expireSecs

  // Privilege map: 1=join_channel, 2=publish_audio, 3=publish_video, 4=publish_data_stream
  const privs: [number, number][] = [[1, expire]]
  if (role === 1) privs.push([2, expire], [3, expire], [4, expire])

  const msg = concat(pu32(ts), pu32(salt), pu32(expire), pmap(privs))

  // UID is packed as uint32 (0 = all users)
  const uidBytes = uid === 0 ? new Uint8Array(4) : pu32(uid)
  const sigInput = concat(enc.encode(APP_ID), enc.encode(channel), uidBytes, msg)

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(APP_CERT), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, sigInput))

  const content    = concat(pbytestr(sig), msg)
  const compressed = await deflate(content)
  return `006${APP_ID}${toB64(compressed)}`
}

// ─── Edge Function handler ──────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile } = await requireAuth(req)

    if (!APP_ID) {
      return new Response(JSON.stringify({ error: 'AGORA_APP_ID not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { channelName, role = 2 } = await req.json()
    if (!channelName) throw new Error('channelName is required')

    // role 1 = host (trainer), role 2 = audience (viewer)
    // Trainers must have plan=elite or role=trainer in their profile
    if (role === 1) {
      const isTrainer = profile.role === 'trainer' || profile.role === 'admin'
        || profile.plan === 'elite'
      if (!isTrainer) throw Object.assign(new Error('Elite or Trainer plan required to go live'), { status: 403 })
    }

    let token: string | null = null
    if (APP_CERT) {
      token = await generateRtcToken(channelName, 0, role as 1 | 2, 3600)
    }
    // If no APP_CERT: Agora App-ID-only mode (dev/test without token enforcement)

    return new Response(JSON.stringify({ token, appId: APP_ID, channelName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    const status = err.status ?? (err.message?.includes('Unauthorized') ? 401 : 500)
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
