// src/app/error.tsx
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-3xl mb-4">⚠️</p>
      <p className="text-lg text-gray-700 mb-2">Something went wrong</p>
      <p className="text-sm text-gray-400 mb-6">An unexpected error occurred.</p>
      <button onClick={reset} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
        Try again
      </button>
    </div>
  )
}