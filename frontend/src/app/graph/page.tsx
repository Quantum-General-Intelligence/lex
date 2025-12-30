'use client'

import { GraphViewer } from '@/components/GraphViewer'
import { PageHeader } from '@/components/PageHeader'
import { GitBranch } from 'lucide-react'

export default function GraphPage() {
  return (
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={GitBranch}
        iconColor="text-purple-400"
        title="Knowledge Graph"
        description="Legal knowledge graph explorer"
      />

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
