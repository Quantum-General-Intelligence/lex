'use client'

import { QueryInterface } from '@/components/QueryInterface'
import { Search, Sparkles } from 'lucide-react'

export default function QueryPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Regulatory Query</h1>
              <p className="text-sm text-slate-500">
                AI-powered regulatory query engine
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
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
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <h3 className="font-medium text-slate-900 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}
