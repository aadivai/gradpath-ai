'use client'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  FileText,
  FileCheck,
  Calendar,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import ThemeSwitchFlowGlass from '@/components/ui/theme-switch-flow-glass'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
      
      {/* Subtle grid mesh backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 pointer-events-none" />
      
      {/* Concentric rings — decorative */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0 opacity-20 dark:opacity-40">
        <div className="absolute inset-0 rounded-full border border-border animate-pulse" />
        <div className="absolute inset-8 rounded-full border border-border/60" />
        <div className="absolute inset-16 rounded-full border border-border/40" />
        <div className="absolute inset-24 rounded-full border border-border/20" />
      </div>

      {/* Top Header Sticky Navigation */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4 print:hidden">
        <div className="bg-card/85 backdrop-blur-md border border-border rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight text-sm">
              Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* The custom WebGL theme switch */}
            <ThemeSwitchFlowGlass intensity={1.2} />
            
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-xs"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center relative z-10 space-y-6">
        
        {/* Release tag */}
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          Free for Indian students · No agents needed
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-foreground leading-[1.05] tracking-tight max-w-3xl mx-auto">
          Get admitted abroad with AI, <br />
          <span className="text-indigo-600 dark:text-indigo-400">not expensive consultants.</span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
          AI-powered university matching, scholarship discovery, visa guidance, and SOP writing — all in one place.
        </p>

        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/signup"
            className="px-6 py-3 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold rounded-full shadow hover:-translate-y-0.5"
          >
            Start for free &rarr;
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border hover:border-foreground/30 bg-card/50 text-foreground text-xs font-bold rounded-full flex items-center gap-1.5 hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features Grid section */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20 relative z-10 border-t border-border">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Our Features</h2>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            Everything you need to navigate the study abroad process, powered by secure AI integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: 'University matcher',
              desc: 'Safe, Moderate, and Ambitious picks based on your CGPA and budget.',
            },
            {
              icon: Award,
              title: 'Scholarship finder',
              desc: 'Government and university scholarships filtered for your profile.',
            },
            {
              icon: FileText,
              title: 'SOP assistant',
              desc: 'AI-generated first draft you can edit and submit with confidence.',
            },
            {
              icon: FileCheck,
              title: 'Visa guidance',
              desc: 'Step-by-step visa requirements for Germany, Canada, UK, and more.',
            },
            {
              icon: Calendar,
              title: 'Timeline tracker',
              desc: 'Month-by-month roadmap so you never miss a deadline.',
            },
            {
              icon: ShieldAlert,
              title: 'Scam transparency',
              desc: 'Real costs, rejection reasons, and broker red flags exposed.',
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="bg-card border border-border hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-6 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-center mb-4 group-hover:scale-105">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="max-w-5xl mx-auto px-6 py-12 relative z-10 border-t border-border text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <span>GradPath AI &middot; Built for Indian students &middot; 100% free during beta</span>
          <span className="font-bold text-foreground/70 flex items-center gap-1">
            &rarr; GradPath AI
          </span>
        </div>
      </footer>
    </div>
  )
}
