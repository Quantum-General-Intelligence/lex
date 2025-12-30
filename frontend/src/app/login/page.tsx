'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, Scale, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setLoginError('Invalid email or password')
      setLoading(false)
    } else if (result?.ok) {
      router.push(callbackUrl)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true)
    setLoginError(null)

    const result = await signIn('credentials', {
      email: demoEmail,
      password: demoPassword,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setLoginError('Demo login failed')
      setLoading(false)
    } else if (result?.ok) {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-vulcan-800 border border-vulcan-600 flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome to Lex</h1>
        <p className="text-vulcan-400 mt-2">Sign in to access the legal intelligence platform</p>
      </div>

      {/* Error Messages */}
      {(error || loginError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">
            {loginError || 'Authentication failed. Please try again.'}
          </p>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-vulcan-800/50 rounded-2xl border border-vulcan-700/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-vulcan-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vulcan-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@lex.dev"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-vulcan-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vulcan-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-vulcan-700" />
          <span className="text-sm text-vulcan-500">or continue with demo</span>
          <div className="flex-1 h-px bg-vulcan-700" />
        </div>

        {/* Demo Accounts */}
        <div className="space-y-3">
          <button
            onClick={() => handleDemoLogin('admin@lex.dev', 'admin123')}
            disabled={loading}
            className="w-full p-3 bg-vulcan-900 hover:bg-vulcan-700/50 border border-vulcan-600 hover:border-vulcan-500 rounded-xl transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-sm">Admin User</div>
                <div className="text-xs text-vulcan-400 mt-0.5">admin@lex.dev</div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                Admin
              </span>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('analyst@lex.dev', 'analyst123')}
            disabled={loading}
            className="w-full p-3 bg-vulcan-900 hover:bg-vulcan-700/50 border border-vulcan-600 hover:border-vulcan-500 rounded-xl transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-sm">Legal Analyst</div>
                <div className="text-xs text-vulcan-400 mt-0.5">analyst@lex.dev</div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                Analyst
              </span>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('demo@lex.dev', 'demo123')}
            disabled={loading}
            className="w-full p-3 bg-vulcan-900 hover:bg-vulcan-700/50 border border-vulcan-600 hover:border-vulcan-500 rounded-xl transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-sm">Demo User</div>
                <div className="text-xs text-vulcan-400 mt-0.5">demo@lex.dev</div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-vulcan-600 text-vulcan-300 rounded-full">
                Viewer
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-vulcan-500 mt-6">
        <Link href="/" className="hover:text-vulcan-300 transition-colors">
          Back to platform
        </Link>
      </p>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-vulcan-800 border border-vulcan-600 flex items-center justify-center mx-auto mb-4 animate-pulse" />
        <div className="h-8 bg-vulcan-800 rounded w-48 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-vulcan-800 rounded w-64 mx-auto animate-pulse" />
      </div>
      <div className="bg-vulcan-800/50 rounded-2xl border border-vulcan-700/50 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-12 bg-vulcan-700 rounded" />
          <div className="h-12 bg-vulcan-700 rounded" />
          <div className="h-12 bg-vulcan-700 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-vulcan-900 flex items-center justify-center px-4">
      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
