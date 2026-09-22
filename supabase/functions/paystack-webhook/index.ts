import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const sig = req.headers.get('x-paystack-signature') ?? ''
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PAYSTACK_SECRET),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const hex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  // constant-time compare
  if (hex.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

// Best-effort push to the business owner after a marketplace payment lands.
async function notifyOwner(supabase: any, kind: string, reference: string) {
  try {
    const map: Record<string, { table: string; fk: string; ownerTable: string; title: string; url: string }> = {
      meal_order:      { table: 'orders',                  fk: 'vendor_id',     ownerTable: 'vendors',         title: 'New paid order',        url: '/vendor/orders' },
      trainer_booking: { table: 'bookings',                fk: 'trainer_id',    ownerTable: 'public_trainers', title: 'New session booked',    url: '/trainer/bookings' },
      gym_membership:  { table: 'gym_memberships',         fk: 'gym_id',        ownerTable: 'gyms',            title: 'New membership',        url: '/gym/members' },
      partnership:     { table: 'influencer_partnerships', fk: 'influencer_id', ownerTable: 'influencers',     title: 'New partnership (paid)', url: '/influencer/partnerships' },
    }
    const m = map[kind]
    if (!m) return
    const { data: row } = await supabase.from(m.table).select(m.fk).eq('paystack_reference', reference).maybeSingle()
    const listingId = row?.[m.fk]
    if (!listingId) return
    const { data: owner } = await supabase.from(m.ownerTable).select('user_id').eq('id', listingId).maybeSingle()
    if (!owner?.user_id) return

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ user_ids: [owner.user_id], title: m.title, body: 'Open WeFit to view it.', url: m.url }),
    })
  } catch { /* never block fulfillment on a notification */ }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  if (!PAYSTACK_SECRET) {
    return new Response(JSON.stringify({ error: 'Payment webhook is not configured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await req.text()

  // Reject requests with invalid HMAC signatures
  if (!(await verifySignature(req, rawBody))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const event = JSON.parse(rawBody)

    // Service-role client for writes that bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const data = event.data

    switch (event.event) {
      case 'charge.success': {
        const userId = data.metadata?.user_id
        const kind   = data.metadata?.kind ?? (data.metadata?.plan ? 'subscription' : null)
        const plan   = data.metadata?.plan
        if (data.currency !== 'NGN' || !data.reference) {
          throw new Error('Payment currency or reference mismatch')
        }

        if (kind === 'subscription' || (plan && ['pro','elite'].includes(plan))) {
          if (!userId || !['pro','elite'].includes(plan)) {
            throw new Error('Invalid subscription payment metadata')
          }
          const expectedAmount = plan === 'pro' ? 250_000 : 500_000
          if (Number(data.amount) !== expectedAmount) throw new Error('Subscription amount mismatch')
          const endsAt = new Date()
          endsAt.setDate(endsAt.getDate() + 30)
          const { error } = await supabase.rpc('upsert_subscription', {
            p_user_id:            userId,
            p_plan:               plan,
            p_paystack_reference: data.reference,
            p_paystack_customer_code: data.customer?.customer_code ?? null,
            p_amount_naira:       Math.round(data.amount / 100),
            p_ends_at:            endsAt.toISOString(),
          })
          if (error) throw error
          break
        }

        if (userId && kind && ['meal_order','trainer_booking','gym_membership','partnership'].includes(kind)) {
          const expectedNaira = await expectedMarketplaceAmount(
            supabase,
            kind,
            data.metadata?.record_id,
            userId,
            data.reference,
          )
          if (Number(data.amount) !== expectedNaira * 100) throw new Error('Payment amount mismatch')
          const { error } = await supabase.rpc('fulfill_marketplace_payment', {
            p_kind: kind,
            p_reference: data.reference,
            p_user_id: userId,
          })
          if (error) throw error
          await notifyOwner(supabase, kind, data.reference)
        } else {
          throw new Error('Invalid marketplace payment metadata')
        }
        break
      }

      case 'subscription.create': {
        const userId = data.metadata?.user_id ?? data.customer?.metadata?.user_id
        const plan   = data.metadata?.plan   ?? data.customer?.metadata?.plan
        if (!userId || !['pro','elite'].includes(plan)) {
          throw new Error('Invalid subscription metadata')
        }

        const { error } = await supabase.rpc('upsert_subscription', {
          p_user_id:                    userId,
          p_plan:                       plan,
          p_paystack_reference:         data.most_recent_invoice?.transaction?.reference ?? '',
          p_paystack_customer_code:     data.customer?.customer_code ?? null,
          p_paystack_subscription_code: data.subscription_code ?? null,
          p_amount_naira:               Math.round((data.amount ?? 0) / 100),
          p_ends_at:                    data.next_payment_date ?? null,
        })
        if (error) throw error
        break
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        // Look up user by paystack subscription code
        const { data: sub, error: lookupError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', data.subscription_code)
          .single()
        if (lookupError) throw lookupError

        if (sub?.user_id) {
          const { error } = await supabase.rpc('cancel_subscription', { p_user_id: sub.user_id })
          if (error) throw error
        }
        break
      }

      case 'invoice.payment_failed': {
        // Mark subscription as expired so user loses access on next check
        const { data: sub, error: lookupError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', data.subscription?.subscription_code)
          .single()
        if (lookupError) throw lookupError

        if (sub?.user_id) {
          const { error: expireError } = await supabase
            .from('subscriptions')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('user_id', sub.user_id)
            .eq('status', 'active')
          if (expireError) throw expireError

          const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', sub.user_id)
          if (profileError) throw profileError
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function expectedMarketplaceAmount(
  supabase: any,
  kind: string,
  recordId: string | undefined,
  userId: string,
  reference: string,
): Promise<number> {
  if (!recordId) throw new Error('Missing payment record metadata')
  const config: Record<string, { table: string; amount: string; owner: string }> = {
    meal_order: { table: 'orders', amount: 'total_naira', owner: 'user_id' },
    trainer_booking: { table: 'bookings', amount: 'amount_naira', owner: 'user_id' },
    gym_membership: { table: 'gym_memberships', amount: 'amount_naira', owner: 'user_id' },
    partnership: { table: 'influencer_partnerships', amount: 'amount_naira', owner: 'brand_user_id' },
  }
  const cfg = config[kind]
  const { data, error } = await supabase
    .from(cfg.table)
    .select(`${cfg.amount}, paystack_reference`)
    .eq('id', recordId)
    .eq(cfg.owner, userId)
    .eq('paystack_reference', reference)
    .maybeSingle()
  if (error || !data) throw new Error('Paid record not found')
  return Number(data[cfg.amount])
}
