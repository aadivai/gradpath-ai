'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-3xl mb-4">⚠️</p>
      <p className="text-lg font-medium text-gray-900 mb-2">Something went wrong</p>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
