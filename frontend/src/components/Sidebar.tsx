'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Flame,
  Search,
  GitBranch,
  FileText,
  Upload,
  Settings,
  Shield,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'

// Vulcan product modules - named after Roman/Classical figures
// Justinian (regulatory), Minerva (policy research), Solon (legislative)
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview & metrics' },
  { name: 'Justinian', href: '/query', icon: Search, description: 'Regulatory query' },
  { name: 'Minerva', href: '/graph', icon: GitBranch, description: 'Knowledge graph' },
  { name: 'Solon', href: '/documents', icon: FileText, description: 'Document library' },
  { name: 'Compliance', href: '/compliance', icon: Shield, description: 'Policy checker' },
  { name: 'Comments', href: '/comments', icon: MessageSquare, description: 'Public comments' },
  { name: 'Ingest', href: '/upload', icon: Upload, description: 'Upload documents' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={`
        ${collapsed ? 'w-[72px]' : 'w-64'}
        bg-slate-900 text-white transition-all duration-300 flex flex-col
        border-r border-slate-800
      `}
    >
      {/* Logo */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight">Vulcan</span>
              <span className="text-[10px] text-slate-500 block -mt-0.5">Regulatory OS</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <Flame className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 hover:bg-slate-800 rounded-lg transition-colors ${collapsed ? 'hidden' : ''}`}
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : ''}`}>
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {item.description}
                  </span>
                </div>
              )}
              {isActive && !collapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 rounded text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full p-2.5 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
        <Link
          href="/settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-slate-400 hover:text-white hover:bg-slate-800
            transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>

        {!collapsed && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
