'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Filter, ExternalLink, Upload, X, Plus } from 'lucide-react'
import { NODE_COLOR_CLASSES } from '@/constants/legalNodeConfig'
import { PageHeader } from '@/components/PageHeader'
import { ConstellationBackground } from '@/components/ConstellationBackground'
import { API_BASE_URL } from '@/lib/api'
import { DocumentListSkeleton } from '@/components/Skeleton'
import { DocumentUpload } from '@/components/DocumentUpload'

interface LegalDocument {
  id: string
  title: string
  citation?: string
  type: string
  jurisdiction: string
  agency?: string
  summary?: string
}

// Demo documents for fallback
const DEMO_DOCUMENTS: LegalDocument[] = [
  { id: 'statute-apa', title: 'Administrative Procedure Act', citation: '5 U.S.C. § 551-559', type: 'Statute', jurisdiction: 'federal', summary: 'The foundational statute governing federal agency rulemaking and adjudication.' },
  { id: 'statute-foia', title: 'Freedom of Information Act', citation: '5 U.S.C. § 552', type: 'Statute', jurisdiction: 'federal', summary: 'Provides public access to federal agency records.' },
  { id: 'statute-privacy-act', title: 'Privacy Act of 1974', citation: '5 U.S.C. § 552a', type: 'Statute', jurisdiction: 'federal', summary: 'Governs the collection and use of personal information by federal agencies.' },
  { id: 'statute-ferpa', title: 'Family Educational Rights and Privacy Act', citation: '20 U.S.C. § 1232g', type: 'Statute', jurisdiction: 'federal', agency: 'Department of Education', summary: 'Protects the privacy of student education records.' },
  { id: 'statute-hipaa', title: 'Health Insurance Portability and Accountability Act', citation: '42 U.S.C. § 1320d', type: 'Statute', jurisdiction: 'federal', agency: 'HHS', summary: 'Establishes national standards to protect sensitive patient health information.' },
  { id: 'statute-clean-air', title: 'Clean Air Act', citation: '42 U.S.C. § 7401', type: 'Statute', jurisdiction: 'federal', agency: 'EPA', summary: 'Comprehensive federal law regulating air emissions.' },
  { id: 'statute-clean-water', title: 'Clean Water Act', citation: '33 U.S.C. § 1251', type: 'Statute', jurisdiction: 'federal', agency: 'EPA', summary: 'Regulates discharges of pollutants into U.S. waters.' },
  { id: 'statute-nepa', title: 'National Environmental Policy Act', citation: '42 U.S.C. § 4321', type: 'Statute', jurisdiction: 'federal', summary: 'Requires environmental impact assessments for federal actions.' },
  { id: 'statute-esa', title: 'Endangered Species Act', citation: '16 U.S.C. § 1531', type: 'Statute', jurisdiction: 'federal', agency: 'Fish and Wildlife Service', summary: 'Provides for the conservation of endangered and threatened species.' },
  { id: 'statute-dodd-frank', title: 'Dodd-Frank Wall Street Reform Act', citation: '12 U.S.C. § 5301', type: 'Statute', jurisdiction: 'federal', summary: 'Comprehensive financial regulatory reform enacted after the 2008 crisis.' },
  { id: 'reg-hipaa-privacy', title: 'HIPAA Privacy Rule', citation: '45 CFR Part 160, 164', type: 'Regulation', jurisdiction: 'federal', agency: 'HHS', summary: 'Establishes standards for protection of health information.' },
  { id: 'reg-ferpa-impl', title: 'FERPA Regulations', citation: '34 CFR Part 99', type: 'Regulation', jurisdiction: 'federal', agency: 'Department of Education', summary: 'Implements FERPA requirements for educational institutions.' },
  { id: 'reg-naaqs', title: 'National Ambient Air Quality Standards', citation: '40 CFR Part 50', type: 'Regulation', jurisdiction: 'federal', agency: 'EPA', summary: 'Air quality standards for criteria pollutants.' },
  { id: 'reg-nepa-impl', title: 'CEQ NEPA Regulations', citation: '40 CFR Parts 1500-1508', type: 'Regulation', jurisdiction: 'federal', agency: 'CEQ', summary: 'Implements NEPA environmental review requirements.' },
  { id: 'case-chevron', title: 'Chevron U.S.A., Inc. v. NRDC', citation: '467 U.S. 837 (1984)', type: 'CaseLaw', jurisdiction: 'federal', summary: 'Established Chevron deference doctrine for agency interpretations.' },
  { id: 'case-loper-bright', title: 'Loper Bright Enterprises v. Raimondo', citation: '603 U.S. ___ (2024)', type: 'CaseLaw', jurisdiction: 'federal', summary: 'Overruled Chevron deference, requiring courts to interpret statutes independently.' },
  { id: 'case-marbury', title: 'Marbury v. Madison', citation: '5 U.S. 137 (1803)', type: 'CaseLaw', jurisdiction: 'federal', summary: 'Established the principle of judicial review.' },
  { id: 'case-west-virginia-epa', title: 'West Virginia v. EPA', citation: '597 U.S. ___ (2022)', type: 'CaseLaw', jurisdiction: 'federal', summary: 'Applied the major questions doctrine to limit agency authority.' },
  { id: 'eo-12866', title: 'E.O. 12866 - Regulatory Planning and Review', citation: 'E.O. 12866', type: 'ExecutiveOrder', jurisdiction: 'federal', agency: 'OMB', summary: 'Establishes principles for regulatory review including cost-benefit analysis.' },
  { id: 'eo-14110', title: 'E.O. 14110 - Safe, Secure AI', citation: 'E.O. 14110', type: 'ExecutiveOrder', jurisdiction: 'federal', summary: 'Establishes requirements for AI safety and trustworthiness.' },
  { id: 'agency-epa', title: 'Environmental Protection Agency', type: 'Agency', jurisdiction: 'federal', summary: 'Independent agency responsible for protecting human health and the environment.' },
  { id: 'agency-sec', title: 'Securities and Exchange Commission', type: 'Agency', jurisdiction: 'federal', summary: 'Enforces federal securities laws and regulates the securities industry.' },
  { id: 'agency-ftc', title: 'Federal Trade Commission', type: 'Agency', jurisdiction: 'federal', summary: 'Focuses on consumer protection and preventing anticompetitive practices.' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [showUpload, setShowUpload] = useState(false)

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
        if (data.length > 0) {
          setDocuments(data)
        } else {
          // Fall back to demo data if no results
          setDocuments(filterDemoDocuments(searchTerm, typeFilter))
        }
      } else {
        setDocuments(filterDemoDocuments(searchTerm, typeFilter))
      }
    } catch {
      // Use demo data on error
      setDocuments(filterDemoDocuments(searchTerm, typeFilter))
    } finally {
      setLoading(false)
    }
  }

  const filterDemoDocuments = (search: string, type: string) => {
    return DEMO_DOCUMENTS.filter(doc => {
      const matchesType = !type || doc.type === type
      const matchesSearch = !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.citation?.toLowerCase().includes(search.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }

  return (
    <div className="min-h-screen bg-vulcan-900 relative overflow-hidden">
      {/* Emerald-themed constellation */}
      <ConstellationBackground
        nodeCount={15}
        connectionDensity={0.2}
        colorScheme="blue"
        interactive={false}
        speed={0.3}
        showOrbs={true}
        showGrid={true}
        opacity={0.3}
      />
      <PageHeader
        icon={FileText}
        iconColor="text-emerald-400"
        title="Document Library"
        description="Legal document library"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-vulcan-700/50 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vulcan-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
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
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Document</span>
              </button>
            </div>
          </div>

          {/* Document List */}
          <div className="divide-y divide-vulcan-700/50">
            {loading ? (
              <div className="p-4">
                <DocumentListSkeleton count={8} />
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

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpload(false)}
          />
          <div className="relative w-full max-w-xl bg-vulcan-800 rounded-2xl border border-vulcan-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-vulcan-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Upload Document</h2>
                  <p className="text-xs text-vulcan-400">Add a legal document to the knowledge base</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-vulcan-400" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <DocumentUpload
                onUploadComplete={() => {
                  fetchDocuments()
                }}
                onClose={() => setShowUpload(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
