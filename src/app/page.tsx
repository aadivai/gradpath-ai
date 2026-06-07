// src/app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Grad<span className="text-indigo-600">Path</span> AI
      </h1>
      <p className="text-lg text-gray-500 max-w-md mb-8">
        Your transparent, AI-powered guide to studying abroad. No agents. No hidden fees. Just clarity.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-up"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Get started free
        </Link>
        <Link href="/sign-in"
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Sign in
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Built for Indian students • 100% free during beta
      </p>
    </div>
  )
}