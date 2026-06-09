import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-lg">
          Grad<span className="text-indigo-600">Path</span> AI
        </span>
        <div className="flex gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          Free for Indian students · No agents needed
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
          Get admitted abroad with AI,
          <br />
          <span className="text-indigo-600">not expensive consultants.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          AI-powered university matching, scholarship discovery, visa guidance,
          and SOP writing — all in one place.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Start for free →
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: '🏛',
            title: 'University matcher',
            desc: 'Safe, Moderate, and Ambitious picks based on your CGPA and budget.',
          },
          {
            icon: '★',
            title: 'Scholarship finder',
            desc: 'Government and university scholarships filtered for your profile.',
          },
          {
            icon: '✎',
            title: 'SOP assistant',
            desc: 'AI-generated first draft you can edit and submit with confidence.',
          },
          {
            icon: '📄',
            title: 'Visa guidance',
            desc: 'Step-by-step visa requirements for Germany, Canada, UK, and more.',
          },
          {
            icon: '◷',
            title: 'Timeline tracker',
            desc: 'Month-by-month roadmap so you never miss a deadline.',
          },
          {
            icon: '⚠',
            title: 'Scam transparency',
            desc: 'Real costs, rejection reasons, and broker red flags exposed.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{f.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 text-center py-6 text-xs text-gray-400">
        GradPath AI · Built for Indian students · 100% free during beta
      </div>
    </div>
  )
}
