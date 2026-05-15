import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

const PLAN_CODES: Record<string, string> = {
  // Set these to your actual Paystack plan codes after creating subscription plans in the Paystack dashboard
  pro:   Deno.env.get('PAYSTACK_PLAN_CODE_PRO')   ?? '',
  elite: Deno.env.get('PAYSTACK_PLAN_CODE_ELITE')  ?? '',
}

const AMOUNTS_KOBO: Record<string, number> = {
  pro:   250_000,  // ₦2,500 in kobo
  elite: 500_000,  // ₦5,000 in kobo
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile } = await requireAuth(req)
    const { plan, callbackUrl } = await req.json()

    if (!['pro', 'elite'].includes(plan)) throw new Error('Invalid plan')

    const email = profile.email ?? ''
    if (!email) throw new Error('User email is required for payment')

    const body: Record<string, unknown> = {
      email,
      amount:   AMOUNTS_KOBO[plan],
      currency: 'NGN',
      metadata: {
        user_id:     userId,
        plan,
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan', value: plan },
          { display_name: 'User ID', variable_name: 'user_id', value: userId },
        ],
      },
      callback_url: callbackUrl ?? `${Deno.env.get('SITE_URL') ?? 'https://wefit.app'}/dashboard?payment=success`,
    }

    // Attach subscription plan code if configured (enables recurring billing)
    if (PLAN_CODES[plan]) {
      body.plan = PLAN_CODES[plan]
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!data.status) throw new Error(data.message ?? 'Paystack initialization failed')

    return new Response(JSON.stringify({
      authorization_url: data.data.authorization_url,
      access_code:       data.data.access_code,
      reference:         data.data.reference,
    }), {
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
