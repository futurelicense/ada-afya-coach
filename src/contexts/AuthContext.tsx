import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User, supabase } from '@/lib/supabase'
import { identifyUser, resetUser } from '@/lib/analytics'

interface AuthContextValue {
  session:    Session | null
  user:       User | null
  loading:    boolean
  signUp:     (email: string, password: string, name: string) => Promise<{ error: Error | null; session: Session | null }>
  signIn:     (email: string, password: string) => Promise<{ error: Error | null }>
  signOut:    () => Promise<void>
  resetPassword:  (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) identifyUser(data.session.user.id, { email: data.session.user.email })
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) identifyUser(session.user.id, { email: session.user.email })
      else resetUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })
    return { error: error as Error | null, session: data.session }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem('fitnaija_current_user')
    localStorage.removeItem('fitnaija_users')
    localStorage.removeItem('wefit_onboarding_completed')
    localStorage.removeItem('userRole')
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error as Error | null }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error as Error | null }
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
