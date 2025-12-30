'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  GitBranch,
  FileText,
  Shield,
  Sparkles,
  Scale,
  Building2,
  Zap,
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import { ModuleCard } from '@/components/ModuleCard'
import { ConstellationBackground } from '@/components/ConstellationBackground'
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
    // Fetch stats from API
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
    <div className="min-h-screen bg-vulcan-900 relative overflow-hidden">
      {/* Interactive Constellation Background */}
      <ConstellationBackground
        nodeCount={35}
        connectionDensity={0.4}
        colorScheme="mixed"
        interactive={true}
        speed={1}
        showOrbs={true}
        showGrid={true}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Left Content */}
            <div className="lg:col-span-3">
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-6">
                Legal Intelligence Platform
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-tight mb-8">
                Map the American
                <br />
                legal system.
              </h1>

              <div className="space-y-6 text-vulcan-300 text-lg leading-relaxed max-w-2xl">
                <p>
                  We're building AI infrastructure for legal analysis. Our platform
                  ingests statutes, regulations, and case law, maps regulatory authority,
                  and helps organizations draft and analyze policy faster than any consulting firm.
                </p>

                <p>
                  Regulatory complexity is crushing innovation. Compliance costs burden
                  small businesses. Our technology changes this by making the law
                  accessible, searchable, and actionable.
                </p>

                <p className="text-white">
                  Query the legal corpus. Trace authority chains. Check compliance
                  instantly.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/query"
                  className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Start querying
                </Link>
                <Link
                  href="/graph"
                  className="px-6 py-3 bg-vulcan-800 hover:bg-vulcan-700 text-white border border-vulcan-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  Explore the graph
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-2">
              <div className="bg-vulcan-800/50 backdrop-blur border border-vulcan-600 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Why Lex</h3>

                <div className="space-y-4 text-vulcan-300 text-sm">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p>AI-powered semantic search across the entire legal corpus with source citations.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <GitBranch className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p>Knowledge graph mapping relationships between statutes, regulations, and agencies.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p>Compliance checking with confidence scores and explainable reasoning.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p>Authority chain analysis showing how regulations derive legal power.</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-vulcan-600">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-white">{stats.documents}</div>
                      <div className="text-xs text-vulcan-400">Documents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-white">{stats.relationships}</div>
                      <div className="text-xs text-vulcan-400">Relationships</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-white">{stats.agencies}</div>
                      <div className="text-xs text-vulcan-400">Agencies</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4 flex items-center gap-2 text-sm text-vulcan-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Demo mode active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try It Now Section */}
      <section className="relative py-16 px-6 border-t border-vulcan-800 bg-vulcan-850/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Try it now
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              Query the legal corpus
            </h2>
            <p className="text-vulcan-400 max-w-xl mx-auto">
              Ask questions in plain English and get AI-powered answers with citations from federal statutes and regulations.
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
                className="w-full pl-12 pr-32 py-4 bg-vulcan-900 border border-vulcan-600 rounded-xl text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
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
                  className="group flex items-center gap-2 px-4 py-2 bg-vulcan-800/50 hover:bg-vulcan-800 border border-vulcan-700 hover:border-accent/50 rounded-lg text-vulcan-300 hover:text-white transition-all text-sm"
                >
                  <Icon className="w-4 h-4 text-vulcan-500 group-hover:text-accent transition-colors" />
                  {demo.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="relative py-20 px-6 border-t border-vulcan-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-2">Modules</h2>
          <p className="text-vulcan-400 mb-10">Core capabilities of the platform</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              href="/query"
              icon={Search}
              name="Regulatory Query"
              description="Query the legal corpus with natural language. Get AI-powered answers with citations, confidence scores, and chain-of-thought reasoning."
            />
            <ModuleCard
              href="/graph"
              icon={GitBranch}
              name="Knowledge Graph"
              description="Visualize relationships between statutes, regulations, case law, and agencies. Trace authority chains and discover connections."
            />
            <ModuleCard
              href="/documents"
              icon={FileText}
              name="Document Library"
              description="Browse and search the legal document corpus. Filter by type, jurisdiction, and agency."
            />
            <ModuleCard
              href="/compliance"
              icon={Shield}
              name="Compliance Checker"
              description="Validate policies and documents against regulatory requirements. Get detailed compliance reports."
            />
            <ModuleCard
              href="/upload"
              icon={Building2}
              name="Document Ingestion"
              description="Upload legal documents to expand the knowledge base. Automatic parsing, chunking, and indexing."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-vulcan-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LexLogo size={32} animated={false} />
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

