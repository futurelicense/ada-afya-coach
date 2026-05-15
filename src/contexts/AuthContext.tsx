import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User, supabase } from '@/lib/supabase'

interface AuthContextValue {
  session:    Session | null
  user:       User | null
  loading:    boolean
  signUp:     (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signIn:     (email: string, password: string) => Promise<{ error: Error | null }>
  signOut:    () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate from existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })
    return { error: error as Error | null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    // Clear legacy localStorage keys from the old auth system
    localStorage.removeItem('fitnaija_current_user')
    localStorage.removeItem('fitnaija_users')
    localStorage.removeItem('wefit_onboarding_completed')
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
