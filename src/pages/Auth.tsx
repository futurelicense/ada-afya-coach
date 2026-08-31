import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { userDataService } from '@/lib/userDataService'

const signUpSchema = z.object({
  name:     z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

const signInSchema = z.object({
  email:    z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignUpData = z.infer<typeof signUpSchema>
type SignInData = z.infer<typeof signInSchema>

function homeForRole(role?: string) {
  if (role === 'vendor') return '/vendor-dashboard'
  if (role === 'trainer') return '/trainer-dashboard'
  if (role === 'gym_owner') return '/gym-owner-dashboard'
  if (role === 'influencer') return '/influencer-dashboard'
  return '/dashboard'
}

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp]       = useState(searchParams.get('mode') === 'signup')
  const [forgot, setForgot]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail]   = useState('')
  const navigate  = useNavigate()
  const { toast } = useToast()
  const { signUp, signIn, resetPassword } = useAuth()

  const signUpForm = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) })
  const signInForm = useForm<SignInData>({ resolver: zodResolver(signInSchema) })

  async function handleSignUp(data: SignUpData) {
    setLoading(true)
    const { error, session } = await signUp(data.email, data.password, data.name)
    setLoading(false)

    if (error) {
      toast({ variant: 'destructive', title: 'Sign up failed', description: error.message })
      return
    }

    if (!session) {
      toast({
        title: 'Check your email',
        description: 'Confirm your address, then sign in to finish setup.',
      })
      setIsSignUp(false)
      return
    }

    toast({ title: 'Account created', description: 'Let’s set up your plan.' })
    navigate('/onboarding')
  }

  async function handleSignIn(data: SignInData) {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    if (error) {
      setLoading(false)
      toast({ variant: 'destructive', title: 'Sign in failed', description: 'Incorrect email or password.' })
      return
    }

    const profile = await userDataService.getProfile()
    setLoading(false)
    toast({ title: 'Welcome back' })
    if (!profile?.onboardingDone) navigate('/onboarding')
    else navigate(homeForRole(profile.role))
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(resetEmail)
    setLoading(false)
    if (error) {
      toast({ variant: 'destructive', title: 'Could not send email', description: error.message })
      return
    }
    toast({ title: 'Check your email', description: 'Use the link to set a new password.' })
    setForgot(false)
  }

  function toggle() {
    setIsSignUp(v => !v)
    setForgot(false)
    signUpForm.reset()
    signInForm.reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8 glass shadow-premium border-white/10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">
              {forgot ? 'Reset password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {forgot
                ? 'We’ll email you a reset link'
                : isSignUp ? 'Start your AI-powered fitness journey' : 'Sign in to continue your progress'}
            </p>
          </div>

          {forgot ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Send reset link
              </Button>
              <button type="button" className="w-full text-sm text-primary" onClick={() => setForgot(false)}>
                Back to sign in
              </button>
            </form>
          ) : isSignUp ? (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g. Tunde Adeyemi" {...signUpForm.register('name')} />
                {signUpForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{signUpForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...signUpForm.register('email')} />
                {signUpForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    {...signUpForm.register('password')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full shadow-glow mt-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...signInForm.register('email')} />
                {signInForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    {...signInForm.register('password')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{signInForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="button" className="text-xs text-primary hover:underline" onClick={() => setForgot(true)}>
                Forgot password?
              </button>
              <Button type="submit" className="w-full shadow-glow mt-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          )}

          {!forgot && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button type="button" onClick={toggle} className="text-primary font-medium hover:underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          )}
        </Card>

        <p className="text-center text-xs text-white/50">
          By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
