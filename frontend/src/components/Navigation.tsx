'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Menu, X, User, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { LexLogo } from './LexLogo'

const navigation = [
  { name: 'Platform', href: '/' },
  { name: 'Query', href: '/query' },
  {
    name: 'Modules',
    href: '#',
    children: [
      { name: 'Knowledge Graph', href: '/graph', description: 'Explore legal relationships' },
      { name: 'Document Library', href: '/documents', description: 'Browse legal corpus' },
      { name: 'Data Sources', href: '/sources', description: 'Import from official sources' },
      { name: 'Compliance', href: '/compliance', description: 'Check policy compliance' },
      { name: 'Comments', href: '/comments', description: 'Analyze public feedback' },
      { name: 'Ingest', href: '/upload', description: 'Upload documents' },
    ],
  },
  { name: 'Resources', href: '/documents' },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vulcan-900 border-b border-vulcan-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <LexLogo size={36} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setModulesOpen(true)}
                    onMouseLeave={() => setModulesOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        modulesOpen ? 'text-white' : 'text-vulcan-300 hover:text-white'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${modulesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {modulesOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                        <div className="bg-vulcan-800 border border-vulcan-700 rounded-xl shadow-xl p-2 min-w-[240px]">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={`block px-4 py-3 rounded-lg transition-colors ${
                                pathname === child.href
                                  ? 'bg-accent/10 text-accent'
                                  : 'hover:bg-vulcan-700 text-vulcan-200 hover:text-white'
                              }`}
                            >
                              <div className="font-medium text-sm">{child.name}</div>
                              <div className="text-xs text-vulcan-400 mt-0.5">{child.description}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-white'
                        : 'text-vulcan-300 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-vulcan-700 animate-pulse" />
            ) : session ? (
              <div
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vulcan-800 border border-vulcan-700 hover:border-vulcan-600 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-white">{session.user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-vulcan-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 pt-2">
                    <div className="bg-vulcan-800 border border-vulcan-700 rounded-xl shadow-xl p-2 min-w-[180px]">
                      <div className="px-3 py-2 border-b border-vulcan-700">
                        <div className="text-sm font-medium text-white">{session.user?.name}</div>
                        <div className="text-xs text-vulcan-400">{session.user?.email}</div>
                        {(session.user as any)?.role && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full capitalize">
                            {(session.user as any).role}
                          </span>
                        )}
                      </div>
                      <Link
                        href="/settings"
                        className="block px-3 py-2 text-sm text-vulcan-200 hover:bg-vulcan-700 rounded-lg mt-1"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-vulcan-700 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-vulcan-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-vulcan-800 border-t border-vulcan-700">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-vulcan-400">{item.name}</div>
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm ${
                          pathname === child.href
                            ? 'bg-accent/10 text-accent'
                            : 'text-vulcan-200 hover:bg-vulcan-700'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-accent/10 text-accent'
                        : 'text-vulcan-200 hover:bg-vulcan-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-vulcan-700 mt-4">
              {session ? (
                <div className="space-y-3">
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium text-white">{session.user?.name}</div>
                    <div className="text-xs text-vulcan-400">{session.user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-vulcan-700 text-red-400 rounded-full text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-5 py-2.5 bg-accent text-white rounded-full text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
