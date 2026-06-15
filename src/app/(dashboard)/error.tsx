'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] px-4">
      <p className="text-3xl mb-4">⚠️</p>
      <h2 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6">{error.message || 'An unexpected error occurred in the dashboard.'}</p>
      <button onClick={reset} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
        Try again
      </button>
    </div>
  )
}
