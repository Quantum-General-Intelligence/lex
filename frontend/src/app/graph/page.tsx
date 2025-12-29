'use client'

import { GraphViewer } from '@/components/GraphViewer'
import { GitBranch } from 'lucide-react'

export default function GraphPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Knowledge Graph</h1>
              <p className="text-sm text-slate-500">
                Legal knowledge graph explorer
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <GraphViewer />
        </div>

        {/* Info section */}
        <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4">
          <h3 className="font-medium text-purple-900 text-sm">About the Knowledge Graph</h3>
          <p className="text-xs text-purple-700 mt-1">
            This visualization shows relationships between legal entities. Click nodes to explore
            authority chains, implementing regulations, and cross-references. Relationships include
            AUTHORIZES, IMPLEMENTS, CITES, and REGULATES.
          </p>
        </div>
      </div>
    </div>
  )
}
