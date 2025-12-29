'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Filter, ExternalLink } from 'lucide-react'

interface LegalDocument {
  id: string
  title: string
  citation?: string
  type: string
  jurisdiction: string
  agency?: string
  summary?: string
}

const TYPE_COLORS: Record<string, string> = {
  Statute: '#3b82f6',
  Regulation: '#8b5cf6',
  CaseLaw: '#10b981',
  ExecutiveOrder: '#ef4444',
  Agency: '#f59e0b',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  useEffect(() => {
    fetchDocuments()
  }, [typeFilter, searchTerm])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('node_type', typeFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '50')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/nodes?${params}`
      )
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Document Library</h1>
              <p className="text-sm text-slate-500">
                Legal document library
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-slate-100 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Statute">Statutes</option>
                <option value="Regulation">Regulations</option>
                <option value="CaseLaw">Case Law</option>
                <option value="ExecutiveOrder">Executive Orders</option>
                <option value="Agency">Agencies</option>
              </select>
            </div>
          </div>

          {/* Document List */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No documents found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {doc.citation && (
                        <p className="text-sm font-mono text-blue-600 mt-0.5">{doc.citation}</p>
                      )}
                      {doc.summary && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {doc.agency && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            {doc.agency}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {doc.jurisdiction}
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 text-xs font-medium rounded-full ml-4 flex-shrink-0"
                      style={{
                        backgroundColor: `${TYPE_COLORS[doc.type] || '#64748b'}15`,
                        color: TYPE_COLORS[doc.type] || '#64748b',
                      }}
                    >
                      {doc.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        {!loading && documents.length > 0 && (
          <div className="mt-4 text-sm text-slate-500 text-center">
            Showing {documents.length} documents
          </div>
        )}
      </div>
    </div>
  )
}
