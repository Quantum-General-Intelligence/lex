'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QueryInterface } from '@/components/QueryInterface'
import { PageHeader } from '@/components/PageHeader'
import { Search } from 'lucide-react'

function QueryContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 p-6">
        <QueryInterface initialQuery={initialQuery} autoSubmit={!!initialQuery} />
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
  )
}

export default function QueryPage() {
  return (
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={Search}
        title="Regulatory Query"
        description="AI-powered regulatory query engine"
      />

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 p-6 flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }>
        <QueryContent />
      </Suspense>
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
