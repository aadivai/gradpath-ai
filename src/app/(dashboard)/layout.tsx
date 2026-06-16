'use client'
import { useUser, useAuth } from '@/components/providers/SupabaseAuthProvider'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
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
  Settings,
  Globe2,
  Users,
  LogOut,
  Menu,
  X,
  Sparkles,
  MoreHorizontal,
  Home,
  Clock
} from 'lucide-react'

/* ─── Navigation structure with sections ─── */
const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/profile',     icon: User,            label: 'Profile' },
    ]
  },
  {
    label: 'Discover',
    items: [
      { href: '/universities',  icon: GraduationCap,  label: 'Universities' },
      { href: '/scholarships',  icon: Award,           label: 'Scholarships' },
      { href: '/explorer',      icon: Globe2,          label: 'Explorer' },
      { href: '/saved-universities', icon: Heart,      label: 'Saved' },
    ]
  },
  {
    label: 'Prepare',
    items: [
      { href: '/sop-assistant',   icon: FileEdit,   label: 'SOP Assistant' },
      { href: '/resume-builder',  icon: FileUser,   label: 'Resume & LOR' },
      { href: '/timeline',        icon: Calendar,   label: 'Timeline' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { href: '/compare',          icon: ArrowLeftRight, label: 'Compare' },
      { href: '/cost-calculator',  icon: Wallet,         label: 'Cost Calculator' },
      { href: '/visa',             icon: FileCheck,       label: 'Visa Guide' },
      { href: '/relocation',       icon: Globe2,          label: 'Relocation' },
    ]
  },
  {
    label: 'Connect',
    items: [
      { href: '/chat',    icon: MessageSquare, label: 'AI Chat' },
      { href: '/alumni',  icon: Users,          label: 'Alumni' },
    ]
  },
]

const adminItem = { href: '/admin', icon: Settings, label: 'Admin' }

/* ─── Bottom nav items for mobile ─── */
const bottomNavItems = [
  { href: '/dashboard',    icon: Home,           label: 'Home' },
  { href: '/universities', icon: GraduationCap,  label: 'Discover' },
  { href: '/chat',         icon: MessageSquare,   label: 'Chat' },
  { href: '/timeline',     icon: Clock,           label: 'Timeline' },
]

/* ─── Flat list for command palette search ─── */
function getAllNavItems(showAdmin: boolean) {
  const items = navSections.flatMap(s => s.items)
  if (showAdmin) items.push(adminItem)
  return items
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { role, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // UI state
  const [commandOpen, setCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const showAdmin = role === 'admin' || role === 'super_admin'

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login')
    }
  }, [isLoaded, user, router])

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleNavigate = useCallback((href: string) => {
    router.push(href)
    setCommandOpen(false)
    setQuery('')
  }, [router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!user) return null

  const allItems = getAllNavItems(showAdmin)
  const filteredNav = allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  /* ─── Shared nav item renderer ─── */
  const renderNavItem = (item: typeof allItems[0], compact = false) => {
    const active = pathname === item.href
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
          active
            ? 'bg-muted text-foreground border-l-2 border-indigo-600 pl-2'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        } ${compact ? 'py-2' : ''}`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
        <span>{item.label}</span>
      </Link>
    )
  }

  /* ─── Sidebar content (shared between desktop sidebar and mobile drawer) ─── */
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-foreground tracking-tight text-base">
          Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span> AI
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-2 flex flex-col gap-0.5 overflow-y-auto px-3">
        {navSections.map((section, idx) => (
          <div key={section.label} className={idx > 0 ? 'mt-4' : ''}>
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium px-2.5 mb-1">
              {section.label}
            </p>
            <div className="flex flex-col gap-px">
              {section.items.map(item => renderNavItem(item))}
            </div>
          </div>
        ))}
        {showAdmin && (
          <div className="mt-4">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium px-2.5 mb-1">
              Settings
            </p>
            {renderNavItem(adminItem)}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </div>
          <p className="text-[13px] font-medium text-foreground truncate">
            {user?.fullName || 'Student'}
          </p>
        </div>
        <button
          onClick={signOut}
          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative print:h-auto print:overflow-visible print:block print:bg-white">

      {/* ─── Desktop Sidebar (≥1024px) ─── */}
      <aside className="hidden lg:flex w-56 bg-background border-r border-border flex-col shrink-0 print:hidden">
        <SidebarContent />
      </aside>

      {/* ─── Mobile/Tablet Drawer Overlay ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col animate-slide-in-drawer"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ─── Main Container ─── */}
      <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">

        {/* Top Header Bar */}
        <header className="h-12 bg-background border-b border-border px-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors lg:hidden"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Logo — visible below lg (when sidebar hidden) */}
            <Link href="/dashboard" className="font-bold text-foreground tracking-tight text-sm lg:hidden">
              Grad<span className="text-indigo-600 dark:text-indigo-400">Path</span>
            </Link>

            {/* Search trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center justify-between w-56 bg-muted/50 hover:bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground font-medium transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Search...
              </span>
              <span className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground/70">
                <Command className="w-2.5 h-2.5" />K
              </span>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setCommandOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors sm:hidden"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <ThemeSwitchFlowGlass intensity={1.0} className="scale-85" />
        </header>

        {/* Content body */}
        <main
          className="flex-1 overflow-y-auto bg-background print:overflow-visible print:block print:bg-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Add bottom padding on mobile for bottom nav */}
          <div className="md:pb-0 pb-16">
            {children}
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation (<768px) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-around md:hidden print:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {bottomNavItems.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {/* More button — opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium text-muted-foreground transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* ─── Persistent AI Quick Access (not on chat page) ─── */}
      {pathname !== '/chat' && (
        <Link
          href="/chat"
          className="fixed z-30 bottom-20 right-4 md:bottom-6 md:right-6 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors print:hidden"
          title="AI Chat"
        >
          <Sparkles className="w-4.5 h-4.5" />
        </Link>
      )}

      {/* ─── Command Palette ─── */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh] p-4 animate-in"
          onClick={() => setCommandOpen(false)}
        >
          <div
            className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[60vh] overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full text-sm outline-none text-foreground font-medium placeholder-muted-foreground bg-transparent"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Pages</p>
              {filteredNav.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No results found.</p>
              ) : (
                filteredNav.map(item => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 hover:bg-muted rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      pathname === item.href ? 'text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {(() => { const Icon = item.icon; return <Icon className="w-4 h-4 shrink-0" /> })()}
                      {item.label}
                    </span>
                    {pathname === item.href && (
                      <span className="text-[9px] text-muted-foreground">Current</span>
                    )}
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