// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl font-bold text-indigo-600 mb-4">404</p>
      <p className="text-lg text-gray-700 mb-2">Page not found</p>
      <p className="text-sm text-gray-400 mb-6">This page doesn't exist or was moved.</p>
      <Link href="/dashboard" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
        Go to dashboard
      </Link>
    </div>
  )
}