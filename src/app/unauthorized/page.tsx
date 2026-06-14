'use client'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Glassmorphic Alert Box */}
      <div className="relative z-10 max-w-md w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6 animate-fade-in">
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        {/* Text content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Access Denied</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Error Code: 403 Forbidden</p>
          <p className="text-sm text-slate-400 leading-relaxed pt-2">
            You do not have the necessary administrative privileges to access this resource. Please contact your system administrator if you believe this is an error.
          </p>
        </div>
        
        {/* Action button */}
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
