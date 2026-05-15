import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, supabase } = await requireAuth(req)
    const { reference } = await req.json()
    if (!reference) throw new Error('No payment reference provided')

    // Verify with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })

    const data = await res.json()
    if (!data.status || data.data.status !== 'success') {
      throw Object.assign(new Error('Payment not successful'), { status: 402 })
    }

    const txn      = data.data
    const plan     = txn.metadata?.plan as string
    const txUserId = txn.metadata?.user_id as string

    if (txUserId !== userId) {
      throw Object.assign(new Error('Payment does not belong to this user'), { status: 403 })
    }

    if (!['pro', 'elite'].includes(plan)) {
      throw new Error('Unknown plan in payment metadata')
    }

    // Persist subscription — 30 days from now (Paystack will renew via webhook)
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

    return new Response(JSON.stringify({ success: true, plan }), {
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
