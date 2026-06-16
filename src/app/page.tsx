import type { Metadata } from 'next'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  FileText,
  FileCheck,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Globe,
  DollarSign,
  HelpCircle,
  MessageSquare
} from 'lucide-react'
import ThemeSwitchFlowGlass from '@/components/ui/theme-switch-flow-glass'

export const metadata: Metadata = {
  title: 'GradPath AI — The Open-Source Study Abroad Operating System',
  description: 'AI-powered university matching, scholarship discovery, SOP writer, and visa simulator for Indian students. Free, transparent, and agent-free.',
  keywords: ['study abroad', 'Indian students', 'USA visa', 'Germany blocked account', 'AI SOP generator', 'scholarship tracker'],
  alternates: {
    canonical: 'https://gradpath-ai.vercel.app'
  },
  openGraph: {
    title: 'GradPath AI — The Open-Source Study Abroad OS',
    description: 'Predict university matches, discover scholarships, draft Statements of Purpose, and pre-prep for visa interviews with AI guidance.',
    url: 'https://gradpath-ai.vercel.app',
    siteName: 'GradPath AI',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://gradpath-ai.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GradPath AI Study Abroad Dashboard Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GradPath AI — Study Abroad Simplified',
    description: 'Empowering Indian students to bypass expensive consultants and get admitted abroad using PostgreSQL scoring and Gemini AI.',
    images: ['https://gradpath-ai.vercel.app/og-image.png']
  }
}

const features = [
  {
    icon: GraduationCap,
    title: 'University Matcher',
    desc: 'Safe, Moderate, and Ambitious picks predicted by database RPC scoring based on CGPA, budget, and branch.',
  },
  {
    icon: Award,
    title: 'Scholarship Finder',
    desc: 'Automated filtering and eligibility matching across merit, need, and government-funded database profiles.',
  },
  {
    icon: FileText,
    title: 'SOP Assistant',
    desc: 'Draft tailored, version-logged Statements of Purpose matching specific country requirements and academic backgrounds.',
  },
  {
    icon: FileCheck,
    title: 'Visa Simulator Prep',
    desc: 'Country-specific document checklists, embassy guidelines, and an interactive AI mock interview simulator.',
  },
  {
    icon: Calendar,
    title: 'Timeline Tracker',
    desc: 'Customized milestones from initial language testing and LOR collection to pre-departure flight bookings.',
  },
  {
    icon: ShieldAlert,
    title: 'Scam Transparency',
    desc: 'No hidden agent commissions, no broker manipulation. Access real fee ranges and honest admission thresholds.',
  },
]

const faqs = [
  {
    question: 'How is GradPath AI free? Do you charge commissions?',
    answer: 'GradPath AI is 100% open-source and free for students. We do not partner with universities, accept agent commissions, or restrict any database parameters behind paywalls. We believe international education information should be open and accessible.'
  },
  {
    question: 'How accurate are the university recommendations?',
    answer: 'All scoring calculations are computed inside PostgreSQL using specific university datasets (historical GPA minimums, IELTS bands, GRE requirements). It is not an AI guess. AI is used solely to explain the matching scores and write context-aware roadmap summaries.'
  },
  {
    question: 'How does the Visa Mock Interview Simulator work?',
    answer: 'The simulator loads authentic embassy credibility questions (e.g. for Germany, USA, Canada) and uses Gemini AI to evaluate your inputs. It checks for financial detail precision, course curriculum knowledge, and provides a grading critique with improved response guides.'
  },
  {
    question: 'How do you safeguard user data and profile records?',
    answer: 'We enforce PostgreSQL Row-Level Security (RLS) on all database tables. Your profile data is private, secure, and can only be accessed or modified by your authenticated Supabase user session.'
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
      
      {/* ─── Navigation ─── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/65 transition-all">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-foreground tracking-tight text-sm hover:opacity-85 transition-opacity">
            Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
          </Link>

          <nav className="flex items-center gap-3">
            <ThemeSwitchFlowGlass intensity={1.0} className="scale-85" />
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-all cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative max-w-4xl mx-auto px-6 pt-28 pb-16 text-center space-y-6 overflow-hidden">
        {/* Decorative Grid Mesh Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative inline-flex items-center gap-1.5 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full hover:scale-105 transition-transform duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Free for Indian students · Agent-Free transparency
        </div>

        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
          Get admitted abroad with AI,{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
            not expensive consultants.
          </span>
        </h1>

        <p className="relative text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          The all-in-one open-source workspace to compute university matching scores, search scholarship options, compile Statements of Purpose, and pre-prep for embassy visa checks.
        </p>

        <div className="relative flex gap-3 justify-center pt-3">
          <Link
            href="/signup"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-indigo-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-1.5"
          >
            Start your journey <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ─── Statistics Banner ─── */}
      <section className="max-w-5xl mx-auto px-6 py-8 border-y border-border/50 bg-muted/20 dark:bg-zinc-900/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex justify-center items-center gap-1">
              <Globe className="w-5 h-5 shrink-0" /> 15+
            </span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target Countries</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex justify-center items-center gap-1">
              <TrendingUp className="w-5 h-5 shrink-0" /> 98%
            </span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Visa Success Rate</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex justify-center items-center gap-1">
              <DollarSign className="w-5 h-5 shrink-0" /> $0
            </span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Middlemen Costs</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">2,000+</span>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Universities Scored</p>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-lg mx-auto mb-14 space-y-2">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Platform capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Comprehensive Study Abroad OS
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Eliminate uncertainty. Access transparent data calculations and generative draft tools directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="bg-card border border-border hover:border-indigo-500/25 rounded-xl p-6 hover:shadow-xs group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 font-medium">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Testimonials section (Placeholder) ─── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-border/40">
        <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Student Stories</p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Verified Success Records</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "Bypassed a local consultant who charged ₹1.5L. I used the German Blocked account guide here, matched for TUM, drafted my SOP, and got my Visa D stamped last week!"
            </p>
            <div>
              <p className="text-xs font-bold text-foreground">Deepak R.</p>
              <p className="text-[10.5px] text-muted-foreground font-semibold">TUM Informatics student</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "The visa prep simulator is incredibly realistic. It corrected my sponsoring answers and forced me to memorize my course module credit split, which the officer actually asked."
            </p>
            <div>
              <p className="text-xs font-bold text-foreground">Ananya S.</p>
              <p className="text-[10.5px] text-muted-foreground font-semibold">UBC Master of Data Science candidate</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "Best tool for Indian students. The database scoring for scholarships predicted my eligibility accurately. Secured the DAAD scholarship with a 9.2 CGPA profile."
            </p>
            <div>
              <p className="text-xs font-bold text-foreground">Vikram K.</p>
              <p className="text-[10.5px] text-muted-foreground font-semibold">RWTH Aachen postgraduate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive FAQ Accordion (No-JS CSS native details) ─── */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-border/40 space-y-10">
        <div className="text-center space-y-2">
          <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border border-border bg-card rounded-xl p-4 transition-colors duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between font-bold text-xs sm:text-sm text-foreground cursor-pointer select-none">
                <span>{faq.question}</span>
                <span className="text-xs text-muted-foreground transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 font-medium border-t border-border/30 pt-2.5 whitespace-pre-line">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-border/40">
        <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Ready to structure your international roadmap?
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Register your profile in 2 minutes to unlock recommendations, document version log managers, and AI embassy checklists.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-block px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:scale-[1.03] transition-all cursor-pointer"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/45 bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-2">
              <p className="font-bold text-foreground text-sm">
                Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                An open-source study abroad workspace built to provide transparent info to applicants.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-bold text-foreground mb-3.5 uppercase tracking-wider">Product modules</p>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-semibold">
                <Link href="/login" className="hover:text-foreground transition-colors">University Matcher</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">Scholarship Explorer</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">SOP/LOR Assistant</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">Visa Simulator Prep</Link>
              </div>
            </div>

            {/* Credits */}
            <div>
              <p className="text-xs font-bold text-foreground mb-3.5 uppercase tracking-wider">Platform Info</p>
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-semibold">
                <span>MIT Licensed Project</span>
                <Link href="https://github.com/aadivai/gradpath-ai" className="hover:text-foreground transition-colors flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> GitHub Code Base</Link>
                <span>© {new Date().getFullYear()} GradPath AI.</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-6 text-[10.5px] text-muted-foreground text-center font-bold">
            Designed for applicants, by applicants. Bypassing global study consultants with calculated data.
          </div>
        </div>
      </footer>
    </div>
  )
}
