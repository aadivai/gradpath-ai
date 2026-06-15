'use client'

import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
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
            Verify Your Identity
          </p>
        </div>

        <div className="glass-card bg-card border border-border/80 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-foreground">Check your inbox</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
              We have dispatched a verification link to your registered email address. 
              Please click the link inside the message to authenticate your profile.
            </p>
          </div>

          <div className="border-t border-border/40 pt-4 flex flex-col gap-2">
            <p className="text-[10px] text-muted-foreground font-semibold">
              Already verified or using a different tab?
            </p>
            <Link
              href="/login"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
