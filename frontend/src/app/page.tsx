'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  GitBranch,
  FileText,
  Shield,
  Scale,
  Building2,
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import { ModuleCard } from '@/components/ModuleCard'
import { LexLogo } from '@/components/LexLogo'

const DEMO_QUERIES = [
  {
    query: "What are the FOIA disclosure requirements?",
    label: "FOIA Requirements",
    icon: FileText,
  },
  {
    query: "Explain FERPA student privacy protections",
    label: "FERPA Privacy",
    icon: Shield,
  },
  {
    query: "What is the Administrative Procedure Act rulemaking process?",
    label: "APA Rulemaking",
    icon: Scale,
  },
  {
    query: "How does the Privacy Act protect personal information?",
    label: "Privacy Act",
    icon: Building2,
  },
]

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState({
    documents: 0,
    relationships: 0,
    agencies: 0,
  })
  const [demoQuery, setDemoQuery] = useState('')

  const handleDemoQuery = (query: string) => {
    router.push(`/query?q=${encodeURIComponent(query)}`)
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (demoQuery.trim()) {
      router.push(`/query?q=${encodeURIComponent(demoQuery)}`)
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/graph/nodes?limit=1`)
        if (res.ok) {
          setStats({
            documents: 20,
            relationships: 21,
            agencies: 3,
          })
        }
      } catch {
        setStats({
          documents: 20,
          relationships: 21,
          agencies: 3,
        })
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-vulcan-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle gradient wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-6">
            Legal Intelligence Platform
          </p>

          <h1 className="text-5xl lg:text-6xl font-semibold text-vulcan-50 leading-[1.1] tracking-tight mb-6">
            Map the American
            <br />
            legal system.
          </h1>

          <p className="text-lg text-vulcan-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI infrastructure for legal analysis. Ingest statutes, regulations,
            and case law, map regulatory authority, and draft and analyze policy
            faster than any consulting firm.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/query"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Start querying
            </Link>
            <Link
              href="/graph"
              className="px-6 py-3 bg-vulcan-800 hover:bg-vulcan-700 text-vulcan-100 border border-vulcan-600 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Explore the graph
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center divide-x divide-vulcan-700">
            <div className="px-10">
              <div className="text-2xl font-semibold text-vulcan-50">{stats.documents}</div>
              <div className="text-sm text-vulcan-500 mt-1">Documents</div>
            </div>
            <div className="px-10">
              <div className="text-2xl font-semibold text-vulcan-50">{stats.relationships}</div>
              <div className="text-sm text-vulcan-500 mt-1">Relationships</div>
            </div>
            <div className="px-10">
              <div className="text-2xl font-semibold text-vulcan-50">{stats.agencies}</div>
              <div className="text-sm text-vulcan-500 mt-1">Agencies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-vulcan-700 rounded-xl overflow-hidden border border-vulcan-700">
          <ModuleCard
            href="/query"
            icon={Search}
            name="Query"
            description="Natural language legal search"
          />
          <ModuleCard
            href="/graph"
            icon={GitBranch}
            name="Graph"
            description="Explore legal relationships"
          />
          <ModuleCard
            href="/documents"
            icon={FileText}
            name="Documents"
            description="Browse the legal corpus"
          />
          <ModuleCard
            href="/compliance"
            icon={Shield}
            name="Compliance"
            description="Validate against regulations"
          />
          <ModuleCard
            href="/upload"
            icon={Building2}
            name="Ingest"
            description="Upload and index documents"
          />
        </div>
      </section>

      {/* Try It Now Section */}
      <section className="py-16 px-6 border-t border-vulcan-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-vulcan-50 mb-3">
              Query the legal corpus
            </h2>
            <p className="text-vulcan-400 max-w-xl mx-auto">
              Ask questions in plain English and get answers with citations from federal statutes and regulations.
            </p>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vulcan-500" />
              <input
                type="text"
                value={demoQuery}
                onChange={(e) => setDemoQuery(e.target.value)}
                placeholder="Ask a legal question..."
                className="w-full pl-12 pr-28 py-4 bg-vulcan-800 border border-vulcan-600 rounded-xl text-vulcan-100 placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-colors"
              >
                Query
              </button>
            </div>
          </form>

          {/* Demo Query Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-vulcan-500 text-sm self-center mr-2">Try:</span>
            {DEMO_QUERIES.map((demo) => {
              const Icon = demo.icon
              return (
                <button
                  key={demo.label}
                  onClick={() => handleDemoQuery(demo.query)}
                  className="flex items-center gap-2 px-4 py-2 bg-vulcan-800 hover:bg-vulcan-700 border border-vulcan-700 hover:border-vulcan-600 rounded-lg text-vulcan-300 hover:text-vulcan-100 transition-all text-sm"
                >
                  <Icon className="w-4 h-4 text-vulcan-500" />
                  {demo.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-vulcan-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LexLogo size={32} />
            <span className="text-vulcan-400 text-sm">Lex - Legal Intelligence Platform</span>
          </div>
          <div className="text-vulcan-500 text-sm">
            Demo instance with sample legal data
          </div>
        </div>
      </footer>
    </div>
  )
}
