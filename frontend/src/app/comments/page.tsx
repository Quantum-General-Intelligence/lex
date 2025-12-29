'use client'

import { MessageSquare, Upload, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export default function CommentsPage() {
  const [analyzing, setAnalyzing] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Comments</h1>
              <p className="text-sm text-slate-500">
                Analyze public comments on proposed regulations
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              Upload Comments
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
              <input type="file" className="hidden" id="comments-upload" accept=".csv,.xlsx,.json" />
              <label
                htmlFor="comments-upload"
                className="cursor-pointer"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="font-medium text-slate-700">Drop comment files here</p>
                <p className="text-sm text-slate-500 mt-1">Supports CSV, Excel, or JSON format</p>
              </label>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Or enter Regulations.gov Docket ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., EPA-HQ-OAR-2021-0208"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  onClick={() => setAnalyzing(true)}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
                >
                  Fetch & Analyze
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Analysis Results
            </h2>
            {analyzing ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Analyzing comments...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 text-sm">Upload comments or enter a docket ID</p>
                <p className="text-xs text-slate-400 mt-1">
                  Extract themes, sentiment, and key concerns
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 text-sm">Coming Soon</h3>
          <p className="text-xs text-blue-700 mt-1">
            Full comment analysis pipeline with sentiment analysis, topic modeling, and automated
            summarization is under development. This interface demonstrates planned functionality.
          </p>
        </div>
      </div>
    </div>
  )
}
