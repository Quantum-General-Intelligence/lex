'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Platform', href: '/' },
  { name: 'Query', href: '/query' },
  {
    name: 'Modules',
    href: '#',
    children: [
      { name: 'Knowledge Graph', href: '/graph', description: 'Explore legal relationships' },
      { name: 'Document Library', href: '/documents', description: 'Browse legal corpus' },
      { name: 'Compliance', href: '/compliance', description: 'Check policy compliance' },
      { name: 'Comments', href: '/comments', description: 'Analyze public feedback' },
      { name: 'Ingest', href: '/upload', description: 'Upload documents' },
    ],
  },
  { name: 'Resources', href: '/documents' },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vulcan-900/80 backdrop-blur-xl border-b border-vulcan-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-vulcan-800 border border-vulcan-600 flex items-center justify-center">
              <span className="text-accent font-bold text-xl">L</span>
            </div>
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
                        <div className="bg-vulcan-800 border border-vulcan-600 rounded-xl shadow-xl p-2 min-w-[240px]">
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

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/query"
              className="px-5 py-2 bg-transparent border border-vulcan-400 text-white rounded-full text-sm font-medium hover:bg-vulcan-800 hover:border-vulcan-300 transition-all"
            >
              Start querying
            </Link>
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
            <div className="pt-4">
              <Link
                href="/query"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-5 py-2.5 bg-accent text-white rounded-full text-sm font-medium"
              >
                Start querying
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
