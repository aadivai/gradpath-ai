"use client"

import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

export function SignOutButton() {
  const router = useRouter()
  const clerk = useClerk()

  const handleSignOut = async () => {
    await clerk.signOut()
    router.push('/')
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Sign out
    </button>
  )
}
