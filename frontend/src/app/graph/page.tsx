'use client'

import { GraphViewer } from '@/components/GraphViewer'
import { GitBranch } from 'lucide-react'

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-vulcan-900">
      {/* Header */}
      <header className="bg-vulcan-900/80 backdrop-blur-xl border-b border-vulcan-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vulcan-800 border border-vulcan-600 rounded-xl flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Knowledge Graph</h1>
              <p className="text-sm text-vulcan-400">
                Legal knowledge graph explorer
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 p-6">
          <GraphViewer />
        </div>

        {/* Info section */}
        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <h3 className="font-medium text-purple-300 text-sm">About the Knowledge Graph</h3>
          <p className="text-xs text-purple-300/70 mt-1">
            This visualization shows relationships between legal entities. Click nodes to explore
            authority chains, implementing regulations, and cross-references. Relationships include
            AUTHORIZES, IMPLEMENTS, CITES, and REGULATES.
          </p>
        </div>
      </div>
    </div>
  )
}
