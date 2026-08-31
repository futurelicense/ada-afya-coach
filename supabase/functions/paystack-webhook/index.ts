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
  return hex === sig
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

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

        if (kind === 'subscription' || (plan && ['pro','elite'].includes(plan))) {
          if (!userId || !['pro','elite'].includes(plan)) break
          const endsAt = new Date()
          endsAt.setDate(endsAt.getDate() + 30)
          await supabase.rpc('upsert_subscription', {
            p_user_id:            userId,
            p_plan:               plan,
            p_paystack_reference: data.reference,
            p_paystack_customer_code: data.customer?.customer_code ?? null,
            p_amount_naira:       Math.round(data.amount / 100),
            p_ends_at:            endsAt.toISOString(),
          })
          break
        }

        if (userId && kind && ['meal_order','trainer_booking','gym_membership','partnership'].includes(kind)) {
          await supabase.rpc('fulfill_marketplace_payment', {
            p_kind: kind,
            p_reference: data.reference,
            p_user_id: userId,
          })
        }
        break
      }

      case 'subscription.create': {
        const userId = data.metadata?.user_id ?? data.customer?.metadata?.user_id
        const plan   = data.metadata?.plan   ?? data.customer?.metadata?.plan
        if (!userId || !['pro','elite'].includes(plan)) break

        await supabase.rpc('upsert_subscription', {
          p_user_id:                    userId,
          p_plan:                       plan,
          p_paystack_reference:         data.most_recent_invoice?.transaction?.reference ?? '',
          p_paystack_customer_code:     data.customer?.customer_code ?? null,
          p_paystack_subscription_code: data.subscription_code ?? null,
          p_amount_naira:               Math.round((data.amount ?? 0) / 100),
          p_ends_at:                    data.next_payment_date ?? null,
        })
        break
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        // Look up user by paystack subscription code
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', data.subscription_code)
          .single()

        if (sub?.user_id) {
          await supabase.rpc('cancel_subscription', { p_user_id: sub.user_id })
        }
        break
      }

      case 'invoice.payment_failed': {
        // Mark subscription as expired so user loses access on next check
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', data.subscription?.subscription_code)
          .single()

        if (sub?.user_id) {
          await supabase
            .from('subscriptions')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('user_id', sub.user_id)
            .eq('status', 'active')

          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', sub.user_id)
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
