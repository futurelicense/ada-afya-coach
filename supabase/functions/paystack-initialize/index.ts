import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth } from '../_shared/auth.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

const PLAN_CODES: Record<string, string> = {
  pro:   Deno.env.get('PAYSTACK_PLAN_CODE_PRO')   ?? '',
  elite: Deno.env.get('PAYSTACK_PLAN_CODE_ELITE')  ?? '',
}

const AMOUNTS_KOBO: Record<string, number> = {
  pro:   250_000,
  elite: 500_000,
}

const MARKETPLACE_KINDS = ['meal_order', 'trainer_booking', 'gym_membership', 'partnership'] as const
type MarketplaceKind = typeof MARKETPLACE_KINDS[number]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { userId, profile, supabase } = await requireAuth(req)
    const bodyIn = await req.json()
    const { plan, callbackUrl, kind } = bodyIn as {
      plan?: string
      callbackUrl?: string
      kind?: string
    }

    const email = profile.email ?? ''
    if (!email) throw new Error('User email is required for payment')

    const site = Deno.env.get('SITE_URL') ?? 'https://wefit.app'
    const paystackBody: Record<string, unknown> = {
      email,
      currency: 'NGN',
    }

    let marketplaceKind: MarketplaceKind | null = null
    let marketplaceRecordId: string | null = null

    if (plan && ['pro', 'elite'].includes(plan)) {
      paystackBody.amount = AMOUNTS_KOBO[plan]
      paystackBody.callback_url = callbackUrl ?? `${site}/dashboard?payment=success`
      paystackBody.metadata = {
        user_id: userId,
        kind: 'subscription',
        plan,
      }
      if (PLAN_CODES[plan]) paystackBody.plan = PLAN_CODES[plan]
    } else if (kind && (MARKETPLACE_KINDS as readonly string[]).includes(kind)) {
      const prepared = await prepareMarketplace(supabase, userId, kind as MarketplaceKind, bodyIn)
      marketplaceKind = kind as MarketplaceKind
      marketplaceRecordId = prepared.recordId
      paystackBody.amount = prepared.amountKobo
      paystackBody.callback_url = callbackUrl ?? `${site}/explore?payment=success`
      paystackBody.metadata = {
        user_id: userId,
        kind,
        listing_id: prepared.listingId,
        record_id: prepared.recordId,
      }
    } else {
      throw new Error('Invalid plan or marketplace kind')
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackBody),
    })

    const data = await res.json()
    if (!data.status) throw new Error(data.message ?? 'Paystack initialization failed')

    const reference = data.data.reference as string
    if (marketplaceKind && marketplaceRecordId) {
      await stampReference(supabase, marketplaceKind, marketplaceRecordId, reference, userId)
    }

    return new Response(JSON.stringify({
      authorization_url: data.data.authorization_url,
      access_code:       data.data.access_code,
      reference,
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

async function prepareMarketplace(supabase: any, userId: string, kind: MarketplaceKind, body: any) {
  if (kind === 'meal_order') {
    const { data: vendor, error } = await supabase.from('vendors').select('id, delivery_fee_naira, min_order_naira').eq('id', body.listingId).single()
    if (error || !vendor) throw new Error('Vendor not found')

    const requested: Array<{ menu_item_id?: string; name?: string; price_naira?: number; qty?: number }> = body.items ?? []
    if (!requested.length) throw new Error('Select at least one meal')

    // Price and stock-check server-side against the real menu. Never trust client prices.
    const ids = requested.map((i) => i.menu_item_id).filter(Boolean) as string[]
    const menu = ids.length
      ? (await supabase.from('vendor_menu_items').select('id, name, price_naira, available, quantity').eq('vendor_id', vendor.id).in('id', ids)).data ?? []
      : []
    const byId = new Map(menu.map((m: any) => [m.id, m]))

    const items = requested.map((i) => {
      const qty = Math.max(1, Math.floor(Number(i.qty) || 1))
      if (i.menu_item_id) {
        const m = byId.get(i.menu_item_id)
        if (!m) throw new Error('A selected dish is no longer on the menu')
        if (!m.available) throw new Error(`"${m.name}" is currently unavailable`)
        if (m.quantity != null && m.quantity < qty) throw new Error(`Only ${m.quantity} of "${m.name}" left`)
        return { menu_item_id: m.id, name: m.name, price_naira: m.price_naira, qty }
      }
      // Legacy path (no menu item id) — fall back to the client-provided price
      return { name: i.name ?? 'Meal', price_naira: Math.max(0, Number(i.price_naira) || 0), qty }
    })

    const subtotal = items.reduce((s, i) => s + i.price_naira * i.qty, 0)
    const delivery = vendor.delivery_fee_naira ?? 0
    const total = subtotal + delivery
    if (vendor.min_order_naira && subtotal < vendor.min_order_naira) {
      throw new Error(`Minimum order is ₦${vendor.min_order_naira}`)
    }
    if (total <= 0 || total > 5_000_000) throw new Error('Invalid amount')
    const { data: row, error: ins } = await supabase.from('orders').insert({
      user_id: userId,
      vendor_id: vendor.id,
      items,
      subtotal_naira: subtotal,
      delivery_fee_naira: delivery,
      total_naira: total,
      status: 'pending',
      delivery_address: body.address ?? '',
      notes: body.phone ?? '',
    }).select('id').single()
    if (ins) throw ins
    return { amountKobo: total * 100, listingId: vendor.id, recordId: row.id }
  }

  if (kind === 'trainer_booking') {
    const { data: trainer, error } = await supabase.from('public_trainers').select('id, price_per_session_naira').eq('id', body.listingId).single()
    if (error || !trainer) throw new Error('Trainer not found')
    const unit = trainer.price_per_session_naira ?? 5000
    const sessions = body.sessionType === 'package-10' ? 10 : body.sessionType === 'package-5' ? 5 : 1
    const discount = sessions === 10 ? 0.85 : sessions === 5 ? 0.9 : 1
    const amount = Math.round(unit * sessions * discount)
    const scheduled = body.scheduledAt ? new Date(body.scheduledAt) : new Date()
    if (Number.isNaN(scheduled.getTime())) throw new Error('Choose a valid date and time')
    const { data: row, error: ins } = await supabase.from('bookings').insert({
      user_id: userId,
      trainer_id: trainer.id,
      session_type: body.inPerson ? 'in-person' : 'online',
      scheduled_at: scheduled.toISOString(),
      duration_minutes: 60 * sessions,
      amount_naira: amount,
      status: 'pending',
      notes: body.notes ?? '',
    }).select('id').single()
    if (ins) throw ins
    return { amountKobo: amount * 100, listingId: trainer.id, recordId: row.id }
  }

  if (kind === 'gym_membership') {
    const { data: gym, error } = await supabase.from('gyms').select('id, membership_plans').eq('id', body.listingId).single()
    if (error || !gym) throw new Error('Gym not found')
    const plans: Array<{ id: string; name: string; amount_naira: number; months: number }> =
      Array.isArray(gym.membership_plans) && gym.membership_plans.length
        ? gym.membership_plans
        : [
            { id: 'monthly', name: 'Monthly', amount_naira: 25000, months: 1 },
            { id: 'quarterly', name: 'Quarterly', amount_naira: 65000, months: 3 },
            { id: 'yearly', name: 'Yearly', amount_naira: 240000, months: 12 },
          ]
    const plan = plans.find(p => p.id === body.planId) ?? plans[0]
    const amount = Number(plan.amount_naira)
    if (amount <= 0) throw new Error('Invalid plan')
    const { data: row, error: ins } = await supabase.from('gym_memberships').insert({
      user_id: userId,
      gym_id: gym.id,
      plan_id: plan.id,
      plan_name: plan.name,
      amount_naira: amount,
      months: plan.months ?? 1,
      status: 'pending',
    }).select('id').single()
    if (ins) throw ins
    return { amountKobo: amount * 100, listingId: gym.id, recordId: row.id }
  }

  // partnership
  const { data: inf, error } = await supabase.from('influencers').select('id, partnership_rate_naira').eq('id', body.listingId).single()
  if (error || !inf) throw new Error('Influencer not found')
  const amount = inf.partnership_rate_naira ?? 50000
  const { data: row, error: ins } = await supabase.from('influencer_partnerships').insert({
    influencer_id: inf.id,
    brand_user_id: userId,
    amount_naira: amount,
    status: 'pending',
    notes: body.notes ?? '',
  }).select('id').single()
  if (ins) throw ins
  return { amountKobo: amount * 100, listingId: inf.id, recordId: row.id }
}

async function stampReference(supabase: any, kind: MarketplaceKind, recordId: string, reference: string, userId: string) {
  if (kind === 'meal_order') {
    await supabase.from('orders').update({ paystack_reference: reference }).eq('id', recordId).eq('user_id', userId)
  } else if (kind === 'trainer_booking') {
    await supabase.from('bookings').update({ paystack_reference: reference }).eq('id', recordId).eq('user_id', userId)
  } else if (kind === 'gym_membership') {
    await supabase.from('gym_memberships').update({ paystack_reference: reference }).eq('id', recordId).eq('user_id', userId)
  } else if (kind === 'partnership') {
    await supabase.from('influencer_partnerships').update({ paystack_reference: reference }).eq('id', recordId).eq('brand_user_id', userId)
  }
}
