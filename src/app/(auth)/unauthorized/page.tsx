'use client'

import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
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
            Authorization Error
          </p>
        </div>

        <div className="glass-card bg-card border border-border/80 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
              You do not have the required administrative role privileges to access this control cockpit module. 
              If this is a mistake, please reach out to your administrator to request access.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
