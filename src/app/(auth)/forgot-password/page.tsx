'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Mail, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password reset link sent! Please check your email inbox.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to request reset link.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
            </h1>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Reset Your Password
          </p>
        </div>

        <div className="glass-card bg-card border border-border/80 rounded-2xl p-8 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Forgot your password?</h2>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              Enter your registered email address and we'll send you a password recovery link.
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

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-75"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4 font-semibold">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
