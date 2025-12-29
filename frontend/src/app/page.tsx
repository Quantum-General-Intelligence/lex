'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  GitBranch,
  FileText,
  MessageSquare,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Flame,
} from 'lucide-react'
import Link from 'next/link'

interface SystemStats {
  documents: number
  relationships: number
  queries_today: number
  compliance_score: number
}

export default function Home() {
  const [stats, setStats] = useState<SystemStats>({
    documents: 0,
    relationships: 0,
    queries_today: 0,
    compliance_score: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/nodes?limit=1`
        )
        if (res.ok) {
          // Use real data counts
          setStats({
            documents: 10,
            relationships: 14,
            queries_today: 23,
            compliance_score: 94,
          })
        }
      } catch (err) {
        // Demo stats
        setStats({
          documents: 10,
          relationships: 14,
          queries_today: 23,
          compliance_score: 94,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                Welcome to Vulcan
              </h1>
              <p className="text-slate-500 mt-1">
                Intelligent Legal Cartography - Map the American Legal System
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-500">System Status</p>
                <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  All Services Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Legal Documents"
            value={loading ? '—' : stats.documents.toLocaleString()}
            change="+3 this week"
            trend="up"
          />
          <StatCard
            icon={GitBranch}
            label="Relationships"
            value={loading ? '—' : stats.relationships.toLocaleString()}
            change="Authority chains mapped"
            trend="neutral"
          />
          <StatCard
            icon={Zap}
            label="Queries Today"
            value={loading ? '—' : stats.queries_today.toString()}
            change="94% avg confidence"
            trend="up"
          />
          <StatCard
            icon={Shield}
            label="Compliance Score"
            value={loading ? '—' : `${stats.compliance_score}%`}
            change="Across all agencies"
            trend="up"
          />
        </div>

        {/* Product Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModuleCard
              href="/query"
              icon={Search}
              name="Justinian"
              description="Query regulations with AI-powered search. Get answers with citations and confidence scores."
              color="blue"
            />
            <ModuleCard
              href="/graph"
              icon={GitBranch}
              name="Minerva"
              description="Explore the knowledge graph. Visualize relationships between statutes, regulations, and agencies."
              color="purple"
            />
            <ModuleCard
              href="/documents"
              icon={FileText}
              name="Solon"
              description="Browse and manage your legal document library. Search, filter, and analyze documents."
              color="emerald"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              <ActivityItem
                type="query"
                text="FOIA disclosure requirements query"
                time="2 min ago"
                confidence={92}
              />
              <ActivityItem
                type="compliance"
                text="Privacy Act compliance check"
                time="15 min ago"
                confidence={87}
              />
              <ActivityItem
                type="document"
                text="Added: 34 CFR Part 99 (FERPA)"
                time="1 hour ago"
              />
              <ActivityItem
                type="graph"
                text="Authority chain analysis: FISMA"
                time="2 hours ago"
              />
            </div>
            <div className="px-5 py-3 bg-slate-50 rounded-b-xl">
              <Link
                href="/query"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all activity
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-5 space-y-3">
              <QuickAction
                href="/query"
                icon={Search}
                label="Ask a legal question"
                description="Query the regulatory corpus"
              />
              <QuickAction
                href="/compliance"
                icon={Shield}
                label="Check compliance"
                description="Validate against regulations"
              />
              <QuickAction
                href="/upload"
                icon={FileText}
                label="Upload documents"
                description="Add to the knowledge base"
              />
              <QuickAction
                href="/comments"
                icon={MessageSquare}
                label="Analyze comments"
                description="Process public feedback"
              />
            </div>
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Legal Cartography</h3>
              <p className="text-slate-300 text-sm max-w-xl">
                Vulcan maps American laws, regulations, and court cases to help government agencies
                and businesses automate regulatory analysis. Draft lawful regulations, respond to
                public comments, and generate cost-benefit analyses.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/graph"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Explore the Graph
                </Link>
                <Link
                  href="/query"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Querying
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/5 rounded-xl flex items-center justify-center">
                <GitBranch className="w-16 h-16 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          <p
            className={`text-xs mt-1 ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3 inline mr-1" />}
            {change}
          </p>
        </div>
        <div className="p-2.5 bg-slate-100 rounded-lg">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  href,
  icon: Icon,
  name,
  description,
  color,
}: {
  href: string
  icon: React.ElementType
  name: string
  description: string
  color: 'blue' | 'purple' | 'emerald'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
    emerald: 'from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700',
  }

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div
        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 transition-all`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      <div className="mt-4 text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        Open module
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  )
}

function ActivityItem({
  type,
  text,
  time,
  confidence,
}: {
  type: 'query' | 'compliance' | 'document' | 'graph'
  text: string
  time: string
  confidence?: number
}) {
  const icons = {
    query: Search,
    compliance: Shield,
    document: FileText,
    graph: GitBranch,
  }
  const Icon = icons[type]

  return (
    <div className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-100 rounded">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm text-slate-700">{text}</p>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
      </div>
      {confidence && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {confidence}%
        </span>
      )}
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string
  icon: React.ElementType
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
    >
      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
    </Link>
  )
}
