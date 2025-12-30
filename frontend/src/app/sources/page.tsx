'use client'

import { useState, useEffect } from 'react'
import { Database, Search, Download, CheckCircle, AlertCircle, Loader2, ExternalLink, FileText, Scale, Building } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ConstellationBackground } from '@/components/ConstellationBackground'
import { API_BASE_URL } from '@/lib/api'

interface SourceStatus {
  name: string
  status: string
  base_url: string
  note?: string
}

interface SearchResult {
  source: string
  type: string
  title: string
  citation: string
  text: string
  url: string
  metadata: Record<string, any>
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Record<string, SourceStatus>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    regulations: SearchResult[]
    statutes: SearchResult[]
    case_law: SearchResult[]
  } | null>(null)
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSourceStatus()
  }, [])

  const fetchSourceStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sources/status`)
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources)
      }
    } catch {
      // Set demo statuses
      setSources({
        ecfr: { name: 'eCFR', status: 'available', base_url: 'https://www.ecfr.gov' },
        congress: { name: 'Congress.gov', status: 'requires_api_key', base_url: 'https://api.congress.gov', note: 'Requires API key' },
        courtlistener: { name: 'CourtListener', status: 'available', base_url: 'https://www.courtlistener.com' },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/sources/search?query=${encodeURIComponent(searchQuery)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      } else {
        // Demo results
        setSearchResults({
          regulations: [
            { source: 'ecfr', type: 'Regulation', title: 'Privacy Act Regulations', citation: '34 CFR 5b', text: 'Regulations implementing the Privacy Act...', url: 'https://ecfr.gov', metadata: {} },
          ],
          statutes: [
            { source: 'congress', type: 'Statute', title: 'Privacy Act of 1974', citation: '5 U.S.C. § 552a', text: 'Records maintained on individuals...', url: 'https://congress.gov', metadata: {} },
          ],
          case_law: [
            { source: 'courtlistener', type: 'CaseLaw', title: 'Doe v. Chao', citation: '540 U.S. 614 (2004)', text: 'Privacy Act damages case...', url: 'https://courtlistener.com', metadata: {} },
          ],
        })
      }
    } catch {
      setSearchResults({ regulations: [], statutes: [], case_law: [] })
    } finally {
      setSearching(false)
    }
  }

  const handleImport = async (result: SearchResult) => {
    setImporting(result.citation)
    try {
      // For demo, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setImportSuccess(result.citation)
      setTimeout(() => setImportSuccess(null), 3000)
    } finally {
      setImporting(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-amber-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Regulation':
        return <FileText className="w-4 h-4 text-blue-400" />
      case 'Statute':
        return <Building className="w-4 h-4 text-purple-400" />
      case 'CaseLaw':
        return <Scale className="w-4 h-4 text-amber-400" />
      default:
        return <FileText className="w-4 h-4 text-vulcan-400" />
    }
  }

  const allResults = searchResults
    ? [...searchResults.regulations, ...searchResults.statutes, ...searchResults.case_law]
    : []

  return (
    <div className="min-h-screen bg-vulcan-900 relative overflow-hidden">
      {/* Purple constellation for data sources */}
      <ConstellationBackground
        nodeCount={18}
        connectionDensity={0.25}
        colorScheme="purple"
        interactive={false}
        speed={0.35}
        showOrbs={true}
        showGrid={true}
        opacity={0.35}
      />
      <PageHeader
        icon={Database}
        iconColor="text-purple-400"
        title="Data Sources"
        description="Import legal data from official sources"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Source Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-vulcan-800/50 rounded-xl border border-vulcan-700/50 p-4 animate-pulse">
                <div className="h-5 bg-vulcan-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-vulcan-700 rounded w-3/4" />
              </div>
            ))
          ) : (
            Object.entries(sources).map(([key, source]) => (
              <div key={key} className="bg-vulcan-800/50 rounded-xl border border-vulcan-700/50 p-4 hover:border-vulcan-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{source.name}</h3>
                  {getStatusIcon(source.status)}
                </div>
                <p className="text-sm text-vulcan-400">
                  {source.status === 'available' ? 'Connected' : source.note || source.status}
                </p>
                <a
                  href={source.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
                >
                  {source.base_url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))
          )}
        </div>

        {/* Search Section */}
        <div className="bg-vulcan-800/50 rounded-xl border border-vulcan-700/50 overflow-hidden">
          <div className="p-4 border-b border-vulcan-700/50">
            <h2 className="font-semibold text-white mb-3">Search Legal Sources</h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vulcan-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search regulations, statutes, and case law..."
                  className="w-full pl-11 pr-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>
          </div>

          {/* Results */}
          {searchResults && (
            <div className="divide-y divide-vulcan-700/50">
              {allResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Database className="w-12 h-12 text-vulcan-600 mx-auto mb-3" />
                  <p className="text-vulcan-300">No results found</p>
                  <p className="text-sm text-vulcan-500 mt-1">Try a different search query</p>
                </div>
              ) : (
                allResults.map((result, i) => (
                  <div key={i} className="p-4 hover:bg-vulcan-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(result.type)}
                          <h4 className="font-medium text-white truncate">{result.title}</h4>
                        </div>
                        {result.citation && (
                          <p className="text-sm font-mono text-accent mt-0.5">{result.citation}</p>
                        )}
                        <p className="text-sm text-vulcan-400 mt-1 line-clamp-2">{result.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-vulcan-700/50 text-vulcan-400 rounded-full">
                            {result.source}
                          </span>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-vulcan-400 hover:text-accent flex items-center gap-1"
                          >
                            View source <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleImport(result)}
                        disabled={importing === result.citation}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          importSuccess === result.citation
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-vulcan-700 hover:bg-vulcan-600 text-white'
                        }`}
                      >
                        {importing === result.citation ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : importSuccess === result.citation ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        {importSuccess === result.citation ? 'Imported' : 'Import'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchResults && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Search Official Legal Sources</h3>
              <p className="text-vulcan-400 max-w-md mx-auto text-sm">
                Search across the Code of Federal Regulations (eCFR), Congressional legislation, and court opinions.
                Import documents directly into your knowledge base.
              </p>
            </div>
          )}
        </div>

        {/* Quick Import Section */}
        <div className="bg-vulcan-800/50 rounded-xl border border-vulcan-700/50 p-6">
          <h2 className="font-semibold text-white mb-4">Quick Import</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="p-4 bg-vulcan-900 hover:bg-vulcan-700/50 rounded-xl border border-vulcan-700 hover:border-vulcan-600 transition-colors text-left">
              <FileText className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="font-medium text-white">CFR Title</h4>
              <p className="text-xs text-vulcan-400 mt-1">Import an entire CFR title</p>
            </button>
            <button className="p-4 bg-vulcan-900 hover:bg-vulcan-700/50 rounded-xl border border-vulcan-700 hover:border-vulcan-600 transition-colors text-left">
              <Building className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-medium text-white">Public Law</h4>
              <p className="text-xs text-vulcan-400 mt-1">Import a specific public law</p>
            </button>
            <button className="p-4 bg-vulcan-900 hover:bg-vulcan-700/50 rounded-xl border border-vulcan-700 hover:border-vulcan-600 transition-colors text-left">
              <Scale className="w-6 h-6 text-amber-400 mb-2" />
              <h4 className="font-medium text-white">Supreme Court</h4>
              <p className="text-xs text-vulcan-400 mt-1">Import Supreme Court opinions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
