'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Filter, ExternalLink } from 'lucide-react'
import { NODE_COLOR_CLASSES } from '@/constants/legalNodeConfig'
import { PageHeader } from '@/components/PageHeader'
import { API_BASE_URL } from '@/lib/api'

interface LegalDocument {
  id: string
  title: string
  citation?: string
  type: string
  jurisdiction: string
  agency?: string
  summary?: string
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

      const res = await fetch(`${API_BASE_URL}/api/graph/nodes?${params}`)
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
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={FileText}
        iconColor="text-emerald-400"
        title="Document Library"
        description="Legal document library"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-vulcan-700/50 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vulcan-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-vulcan-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-vulcan-600 rounded-lg px-3 py-2.5 text-sm text-vulcan-200 bg-vulcan-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
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
          <div className="divide-y divide-vulcan-700/50">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-vulcan-400">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-vulcan-600 mx-auto mb-3" />
                <p className="text-vulcan-300">No documents found</p>
                <p className="text-sm text-vulcan-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-vulcan-700/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">{doc.title}</h3>
                        <ExternalLink className="w-3.5 h-3.5 text-vulcan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {doc.citation && (
                        <p className="text-sm font-mono text-accent mt-0.5">{doc.citation}</p>
                      )}
                      {doc.summary && (
                        <p className="text-sm text-vulcan-400 mt-1 line-clamp-2">{doc.summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {doc.agency && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">
                            {doc.agency}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-vulcan-700/50 text-vulcan-400 rounded-full">
                          {doc.jurisdiction}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ml-4 flex-shrink-0 border ${
                        NODE_COLOR_CLASSES[doc.type]?.bg || 'bg-vulcan-700/50'
                      } ${NODE_COLOR_CLASSES[doc.type]?.border || ''} ${NODE_COLOR_CLASSES[doc.type]?.text || 'text-vulcan-400'}`}
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
          <div className="mt-4 text-sm text-vulcan-500 text-center">
            Showing {documents.length} documents
          </div>
        )}
      </div>
    </div>
  )
}
