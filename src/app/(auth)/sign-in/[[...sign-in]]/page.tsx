import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div>
        <div className="text-center mb-6">
          <span className="text-2xl font-semibold text-gray-900">
            Grad<span className="text-indigo-600">Path</span> AI
          </span>
          <p className="text-sm text-gray-500 mt-1">Welcome back</p>
        </div>
        <SignIn fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  )
}