'use client'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ThemeSwitchFlowGlass from '@/components/ui/theme-switch-flow-glass'
import { 
  Search, 
  Command, 
  LayoutDashboard, 
  User, 
  GraduationCap, 
  Award, 
  Heart, 
  FileEdit, 
  FileCheck, 
  Calendar, 
  ArrowLeftRight, 
  Wallet, 
  FileUser, 
  MessageSquare, 
  Settings 
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile',            icon: User,            label: 'My profile' },
  { href: '/universities',       icon: GraduationCap,   label: 'Universities' },
  { href: '/scholarships',       icon: Award,           label: 'Scholarships' },
  { href: '/saved-universities', icon: Heart,           label: 'Saved' },
  { href: '/sop-assistant',      icon: FileEdit,        label: 'SOP assistant' },
  { href: '/visa',               icon: FileCheck,       label: 'Visa guide' },
  { href: '/timeline',           icon: Calendar,        label: 'Timeline' },
  { href: '/compare',            icon: ArrowLeftRight,  label: 'Compare' },
  { href: '/cost-calculator',    icon: Wallet,          label: 'Cost Calculator' },
  { href: '/resume-builder',     icon: FileUser,        label: 'Resume Builder' },
  { href: '/chat',               icon: MessageSquare,   label: 'AI Chat Counselor' },
  { href: '/admin',              icon: Settings,        label: 'Admin Panel' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router   = useRouter()
  const pathname = usePathname()

  // Command palette state
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string>('student')

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }

    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('clerk_user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name && data.full_name.includes('|||')) {
            try {
              const meta = JSON.parse(data.full_name.split('|||')[1])
              if (meta.role) setRole(meta.role)
            } catch (e) {}
          }
        })
    }
  }, [isLoaded, user, router])

  // Keyboard shortcut listener (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!user) return null

  // Filter visible nav items based on role
  const visibleNavItems = navItems.filter(item => {
    if (item.href === '/admin') {
      return role === 'admin' || role === 'super_admin'
    }
    return true
  })

  // Filter items in command palette
  const filteredNav = visibleNavItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleNavigate = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      
      {/* Sidebar aside */}
      <aside className="w-60 bg-card/75 backdrop-blur-md border-r border-border flex flex-col shrink-0">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <span className="font-bold text-foreground tracking-tight text-sm">
            Grad<span className="text-indigo-400">Path</span> AI
          </span>
          <span className="text-[9px] bg-indigo-50/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-bold tracking-wide">V2.0</span>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto px-3">
          {visibleNavItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground/80 group-hover:text-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border/40 flex items-center gap-3 bg-muted/20">
          <UserButton />
          <span className="text-xs text-foreground/80 font-semibold">My Account</span>
        </div>
      </aside>


      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
          {/* Palette trigger button */}
          <button 
            onClick={() => setOpen(true)}
            className="flex items-center justify-between w-64 bg-muted/40 hover:bg-muted/70 border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground font-medium transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              Search modules...
            </span>
            <span className="flex items-center gap-0.5 font-mono text-[9px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-muted-foreground font-medium">
              Beta Sandbox Access
            </div>
            <ThemeSwitchFlowGlass intensity={1.0} className="scale-90" />
          </div>
        </header>

        {/* Content main body */}
        <main className="flex-1 overflow-y-auto bg-background/50 dark:bg-zinc-950/20">{children}</main>
      </div>

      {/* Search Palette Overlay Modal */}
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-[15vh] p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[60vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Search className="w-4.5 h-4.5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tools and navigation modules..."
                className="w-full text-sm outline-none text-foreground font-medium placeholder-muted-foreground bg-transparent"
              />
            </div>

            {/* List Results */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Modules & Shortcuts</p>
              {filteredNav.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No matching modules found.</p>
              ) : (
                filteredNav.map(item => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-muted rounded-lg text-xs font-semibold text-foreground hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {(() => { const Icon = item.icon; return <Icon className="w-4 h-4 text-muted-foreground shrink-0" />; })()}
                      {item.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-normal">Go to &rarr;</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}