'use client'

import { MessageSquare, Upload, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export default function CommentsPage() {
  const [analyzing, setAnalyzing] = useState(false)

  return (
    <div className="min-h-screen bg-vulcan-900">
      {/* Header */}
      <header className="bg-vulcan-900 border-b border-vulcan-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vulcan-800 border border-vulcan-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Comments</h1>
              <p className="text-sm text-vulcan-400">
                Analyze public comments on proposed regulations
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-vulcan-400" />
              Upload Comments
            </h2>
            <div className="border-2 border-dashed border-vulcan-600 rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors">
              <input type="file" className="hidden" id="comments-upload" accept=".csv,.xlsx,.json" />
              <label
                htmlFor="comments-upload"
                className="cursor-pointer"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-vulcan-500" />
                <p className="font-medium text-white">Drop comment files here</p>
                <p className="text-sm text-vulcan-400 mt-1">Supports CSV, Excel, or JSON format</p>
              </label>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-vulcan-400 mb-2">
                Or enter Regulations.gov Docket ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., EPA-HQ-OAR-2021-0208"
                  className="flex-1 border border-vulcan-600 rounded-lg px-3 py-2.5 text-sm bg-vulcan-900 text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <button
                  onClick={() => setAnalyzing(true)}
                  className="px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm font-medium transition-colors"
                >
                  Fetch & Analyze
                </button>
              </div>
            </div>
          </div>

          <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-vulcan-400" />
              Analysis Results
            </h2>
            {analyzing ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-vulcan-400">Analyzing comments...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-vulcan-600" />
                <p className="text-vulcan-300 text-sm">Upload comments or enter a docket ID</p>
                <p className="text-xs text-vulcan-500 mt-1">
                  Extract themes, sentiment, and key concerns
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
          <h3 className="font-medium text-accent-light text-sm">Coming Soon</h3>
          <p className="text-xs text-accent-light/70 mt-1">
            Full comment analysis pipeline with sentiment analysis, topic modeling, and automated
            summarization is under development. This interface demonstrates planned functionality.
          </p>
        </div>
      </div>
    </div>
  )
}
