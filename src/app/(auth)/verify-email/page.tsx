'use client'

import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
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
            Verify Your Identity
          </p>
        </div>

        <div className="glass-card bg-card border border-border rounded-xl p-8 shadow-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground">Check your inbox</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              We have dispatched a verification link to your registered email address. 
              Please click the link inside the message to authenticate your profile.
            </p>
          </div>

          <div className="border-t border-border/40 pt-4 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-semibold">
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
