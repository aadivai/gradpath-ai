'use client'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
  { href: '/dashboard',          icon: '⊞', label: 'Dashboard' },
  { href: '/profile',            icon: '◉', label: 'My profile' },
  { href: '/universities',       icon: '🏛', label: 'Universities' },
  { href: '/scholarships',       icon: '★', label: 'Scholarships' },
  { href: '/saved-universities', icon: '♡', label: 'Saved' },
  { href: '/sop-assistant',      icon: '✎', label: 'SOP assistant' },
  { href: '/visa',               icon: '📄', label: 'Visa guide' },
  { href: '/timeline',           icon: '◷', label: 'Timeline' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router   = useRouter()
  const pathname = usePathname()

  // Client-side auth guard — works with dev keys on Vercel
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  // Show spinner while Clerk loads session
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Don't flash dashboard to unauthenticated users
  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">
            Grad<span className="text-indigo-600">Path</span> AI
          </span>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
          <UserButton />
          <span className="text-xs text-gray-500">Account</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}