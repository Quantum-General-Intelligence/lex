'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  GitBranch,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
  Scale,
  Building2,
  MessageSquare,
  Zap,
} from 'lucide-react'

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/nodes?limit=1`
        )
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
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />

        {/* Network graph pattern - dots */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#3b82f6" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-dots)" />
        </svg>

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Animated gradient for data flow effect */}
            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0">
                <animate attributeName="offset" values="-0.5;1" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6">
                <animate attributeName="offset" values="0;1.5" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0">
                <animate attributeName="offset" values="0.5;2" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0">
                <animate attributeName="offset" values="-0.5;1" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5">
                <animate attributeName="offset" values="0;1.5" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0">
                <animate attributeName="offset" values="0.5;2" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Static connection lines */}
          <line x1="10%" y1="20%" x2="30%" y2="35%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.15" />
          <line x1="30%" y1="35%" x2="50%" y2="25%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.15" />
          <line x1="50%" y1="25%" x2="70%" y2="40%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.15" />
          <line x1="70%" y1="40%" x2="90%" y2="30%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.15" />
          <line x1="20%" y1="60%" x2="40%" y2="70%" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.12" />
          <line x1="40%" y1="70%" x2="60%" y2="65%" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.12" />
          <line x1="60%" y1="65%" x2="80%" y2="75%" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.12" />
          <line x1="30%" y1="35%" x2="40%" y2="70%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.1" />
          <line x1="50%" y1="25%" x2="60%" y2="65%" stroke="#3b82f6" strokeWidth="0.5" opacity="0.1" />

          {/* Animated flow lines */}
          <line x1="10%" y1="20%" x2="30%" y2="35%" stroke="url(#flowGradient1)" strokeWidth="2" />
          <line x1="30%" y1="35%" x2="50%" y2="25%" stroke="url(#flowGradient1)" strokeWidth="2" />
          <line x1="50%" y1="25%" x2="70%" y2="40%" stroke="url(#flowGradient1)" strokeWidth="2" />
          <line x1="20%" y1="60%" x2="40%" y2="70%" stroke="url(#flowGradient2)" strokeWidth="2" />
          <line x1="40%" y1="70%" x2="60%" y2="65%" stroke="url(#flowGradient2)" strokeWidth="2" />

          {/* Pulsing nodes - primary row */}
          <circle cx="10%" cy="20%" r="4" fill="#3b82f6" opacity="0.6">
            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30%" cy="35%" r="5" fill="#3b82f6" opacity="0.7">
            <animate attributeName="r" values="5;7;5" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.4;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="50%" cy="25%" r="4" fill="#3b82f6" opacity="0.5">
            <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.3;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="40%" r="6" fill="#3b82f6" opacity="0.6">
            <animate attributeName="r" values="6;8;6" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.35;0.6" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="90%" cy="30%" r="4" fill="#3b82f6" opacity="0.4">
            <animate attributeName="r" values="4;5;4" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.25;0.4" dur="2.8s" repeatCount="indefinite" />
          </circle>

          {/* Pulsing nodes - secondary row */}
          <circle cx="20%" cy="60%" r="3" fill="#8b5cf6" opacity="0.5">
            <animate attributeName="r" values="3;5;3" dur="2.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.3;0.5" dur="2.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="40%" cy="70%" r="4" fill="#8b5cf6" opacity="0.6">
            <animate attributeName="r" values="4;6;4" dur="2.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.35;0.6" dur="2.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="60%" cy="65%" r="3" fill="#8b5cf6" opacity="0.45">
            <animate attributeName="r" values="3;5;3" dur="3.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0.25;0.45" dur="3.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="75%" r="3" fill="#8b5cf6" opacity="0.4">
            <animate attributeName="r" values="3;4;3" dur="2.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.25;0.4" dur="2.9s" repeatCount="indefinite" />
          </circle>

          {/* Center glow effect */}
          <circle cx="50%" cy="45%" r="100" fill="url(#centerGlow)" opacity="0.15">
            <animate attributeName="r" values="100;120;100" dur="4s" repeatCount="indefinite" />
          </circle>
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vulcan-800 border border-vulcan-600 flex items-center justify-center">
              <span className="text-accent font-bold">L</span>
            </div>
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

function ModuleCard({
  href,
  icon: Icon,
  name,
  description,
}: {
  href: string
  icon: React.ElementType
  name: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group bg-vulcan-800/30 hover:bg-vulcan-800/50 border border-vulcan-700 hover:border-vulcan-600 rounded-xl p-6 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-vulcan-800 border border-vulcan-600 flex items-center justify-center mb-4 group-hover:border-accent/50 transition-colors">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="text-white font-medium mb-2">{name}</h3>
      <p className="text-vulcan-400 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-1 text-accent text-sm font-medium">
        <span>Open module</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}
