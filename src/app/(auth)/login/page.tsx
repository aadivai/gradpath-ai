'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    if (errorParam) {
      setMessage({ type: 'error', text: errorParam })
    } else if (messageParam) {
      setMessage({ type: 'success', text: messageParam })
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed.' })
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email to receive a login link.' })
      return
    }
    setMagicLinkLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Magic Link sent! Please check your inbox.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send login link.' })
    } finally {
      setMagicLinkLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setMessage({ type: 'error', text: `OAuth failed: ${err.message}` })
    }
  }

  return (
    <div className="glass-card bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to manage your applications.
        </p>
      </div>

      {message.text && (
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex gap-2 ${
          message.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          {message.type === 'error' ? (
            <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuthLogin('google')}
          className="py-2.5 px-4 bg-muted/40 hover:bg-muted/70 border border-border/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-foreground"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          onClick={() => handleOAuthLogin('github')}
          className="py-2.5 px-4 bg-muted/40 hover:bg-muted/70 border border-border/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-foreground"
        >
          <svg className="w-4 h-4 text-foreground fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="relative flex py-2 items-center text-xs text-muted-foreground font-semibold">
        <div className="flex-grow border-t border-border/40"></div>
        <span className="flex-shrink mx-3 uppercase tracking-wider text-[10px]">Or continue with</span>
        <div className="flex-grow border-t border-border/40"></div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-xs font-semibold bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all"
            />
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-xs font-semibold bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all"
            />
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-75"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={magicLinkLoading}
            className="py-2.5 px-4 bg-muted/40 hover:bg-muted/70 text-foreground border border-border/80 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Sign in with magic email link"
          >
            {magicLinkLoading ? 'Sending...' : 'Magic Link'}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-4 font-semibold">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            AI Study Abroad Platform
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center flex flex-col items-center justify-center h-80">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
