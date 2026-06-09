'use client'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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

export default function NavSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button className="md:hidden p-4 text-gray-600 fixed top-0 left-0 z-50" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-4 border-b border-gray-100 flex h-14 md:h-auto items-center md:items-start pl-14 md:pl-5">
          <span className="font-semibold text-gray-900">
            Grad<span className="text-indigo-600">Path</span> AI
          </span>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
                  ${active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <UserButton />
        </div>
      </aside>
    </>
  )
}
