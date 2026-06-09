import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-indigo-600 mb-4">404</p>
      <p className="text-lg font-medium text-gray-900 mb-2">Page not found</p>
      <p className="text-sm text-gray-500 mb-6">
        This page doesn't exist or was moved.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
