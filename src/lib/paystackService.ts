import { supabase } from './supabase'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization:  `Bearer ${session?.access_token ?? ''}`,
    'Content-Type': 'application/json',
  }
}

export const paystackService = {
  /**
   * Initialise a Paystack transaction and redirect the browser to the payment page.
   * Returns to /dashboard?payment=success after the user pays.
   */
  async startCheckout(plan: 'pro' | 'elite'): Promise<void> {
    const headers = await authHeaders()
    const callbackUrl = `${window.location.origin}/dashboard?payment=success&plan=${plan}`

    const res = await fetch(`${FUNCTIONS_URL}/paystack-initialize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan, callbackUrl }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to initialise payment')

    window.location.href = data.authorization_url
  },

  /**
   * Verify a payment after the user returns from Paystack.
   * Returns the confirmed plan on success.
   */
  /**
   * Verify a payment after the user returns from Paystack.
   */
  async verifyPayment(reference: string): Promise<{ plan?: string; kind?: string }> {
    const headers = await authHeaders()

    const res = await fetch(`${FUNCTIONS_URL}/paystack-verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reference }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Payment verification failed')
    return data
  },

  /** Return the user's current active subscription, or null. */
  async getActiveSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('id, plan, status, starts_at, ends_at, amount_naira')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return data
  },
}
