import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    if (!PAYSTACK_SECRET) throw Object.assign(new Error('Payment service is not configured'), { status: 503 })

    const { userId, supabase } = await requireAuth(req)
    const { reference } = await req.json()
    if (!reference) throw new Error('No payment reference provided')

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })

    const data = await res.json()
    if (!res.ok) {
      throw Object.assign(new Error(data.message ?? 'Payment verification failed'), { status: 502 })
    }
    if (!data.status || data.data.status !== 'success') {
      throw Object.assign(new Error('Payment not successful'), { status: 402 })
    }

    const txn      = data.data
    const kind     = (txn.metadata?.kind as string) ?? 'subscription'
    const txUserId = txn.metadata?.user_id as string

    if (txn.currency !== 'NGN' || txn.reference !== reference) {
      throw Object.assign(new Error('Payment currency or reference mismatch'), { status: 400 })
    }

    if (txUserId !== userId) {
      throw Object.assign(new Error('Payment does not belong to this user'), { status: 403 })
    }

    if (kind === 'subscription' || ['pro', 'elite'].includes(txn.metadata?.plan)) {
      const plan = txn.metadata?.plan as string
      if (!['pro', 'elite'].includes(plan)) throw new Error('Unknown plan in payment metadata')
      const expectedAmount = plan === 'pro' ? 250_000 : 500_000
      if (Number(txn.amount) !== expectedAmount) {
        throw Object.assign(new Error('Subscription amount mismatch'), { status: 400 })
      }

      const endsAt = new Date()
      endsAt.setDate(endsAt.getDate() + 30)

      const { error } = await supabase.rpc('upsert_subscription', {
        p_user_id:          userId,
        p_plan:             plan,
        p_paystack_reference: reference,
        p_amount_naira:     Math.round(txn.amount / 100),
        p_ends_at:          endsAt.toISOString(),
      })
      if (error) throw error

      return new Response(JSON.stringify({ success: true, kind: 'subscription', plan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['meal_order', 'trainer_booking', 'gym_membership', 'partnership'].includes(kind)) {
      throw Object.assign(new Error('Unknown payment kind'), { status: 400 })
    }

    const expectedNaira = await expectedMarketplaceAmount(
      supabase,
      kind,
      txn.metadata?.record_id,
      userId,
      reference,
    )
    if (Number(txn.amount) !== expectedNaira * 100) {
      throw Object.assign(new Error('Payment amount mismatch'), { status: 400 })
    }

    const { error } = await supabase.rpc('fulfill_marketplace_payment', {
      p_kind: kind,
      p_reference: reference,
      p_user_id: userId,
    })
    if (error) throw error

    return new Response(JSON.stringify({ success: true, kind }), {
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

async function expectedMarketplaceAmount(
  supabase: any,
  kind: string,
  recordId: string | undefined,
  userId: string,
  reference: string,
): Promise<number> {
  if (!recordId) throw Object.assign(new Error('Missing payment record metadata'), { status: 400 })
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
  if (error || !data) throw Object.assign(new Error('Paid record not found'), { status: 400 })
  return Number(data[cfg.amount])
}
