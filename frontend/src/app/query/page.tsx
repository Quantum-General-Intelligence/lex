'use client'

import { QueryInterface } from '@/components/QueryInterface'
import { Search } from 'lucide-react'

export default function QueryPage() {
  return (
    <div className="min-h-screen bg-vulcan-900">
      {/* Header */}
      <header className="bg-vulcan-900/80 backdrop-blur-xl border-b border-vulcan-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vulcan-800 border border-vulcan-600 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Regulatory Query</h1>
              <p className="text-sm text-vulcan-400">
                AI-powered regulatory query engine
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 p-6">
          <QueryInterface />
        </div>

        {/* Help section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <HelpCard
            title="Natural Language"
            description="Ask questions in plain English. No legal jargon required."
          />
          <HelpCard
            title="Cited Answers"
            description="Every response includes source citations and confidence scores."
          />
          <HelpCard
            title="Graph Context"
            description="Answers incorporate relationships from the knowledge graph."
          />
        </div>
      </div>
    </div>
  )
}

function HelpCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-vulcan-800/30 backdrop-blur-sm rounded-xl p-4 border border-vulcan-700/50">
      <h3 className="font-medium text-white text-sm">{title}</h3>
      <p className="text-xs text-vulcan-400 mt-1">{description}</p>
    </div>
  )
}
