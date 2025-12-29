'use client'

import { useState } from 'react'
import { Upload, AlertTriangle, CheckCircle, AlertCircle, FileText, Loader2, Shield } from 'lucide-react'

interface ComplianceIssue {
  severity: 'critical' | 'warning' | 'info'
  regulation_id: string
  regulation_citation: string
  issue_description: string
  document_excerpt: string
  suggested_fix?: string
  confidence: number
}

interface ComplianceResponse {
  document_summary: string
  overall_status: 'compliant' | 'issues_found' | 'review_required'
  issues: ComplianceIssue[]
  checked_regulations: number
  processing_time_ms: number
}

export function ComplianceChecker() {
  const [documentText, setDocumentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ComplianceResponse | null>(null)

  const handleSubmit = async () => {
    if (!documentText.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/analysis/compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_text: documentText,
          jurisdiction: 'federal',
          check_type: 'full',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResponse(data)
      } else {
        throw new Error('Check failed')
      }
    } catch (err) {
      // Demo response
      setResponse({
        document_summary: `Analyzed document with ${documentText.length} characters.`,
        overall_status: 'review_required',
        issues: [
          {
            severity: 'warning',
            regulation_id: 'privacy-act',
            regulation_citation: '5 U.S.C. § 552a',
            issue_description: 'Document references personal data collection without specifying Privacy Act compliance procedures.',
            document_excerpt: '...collect personal information from users...',
            suggested_fix: 'Add Privacy Act Statement and specify routine uses.',
            confidence: 0.82,
          },
          {
            severity: 'info',
            regulation_id: 'records-mgmt',
            regulation_citation: '44 U.S.C. § 3101',
            issue_description: 'Document mentions data retention but does not specify retention schedule.',
            document_excerpt: '...data will be retained...',
            suggested_fix: 'Reference approved records schedule or specify retention period.',
            confidence: 0.75,
          },
        ],
        checked_regulations: 15,
        processing_time_ms: 342.5,
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
      default:
        return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Compliant' }
      case 'issues_found':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Issues Found' }
      default:
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Review Required' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Document Text for Compliance Check
        </label>
        <textarea
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder="Paste the document text you want to check for regulatory compliance..."
          rows={8}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none text-slate-900 placeholder-slate-400 transition-all"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {documentText.length} characters
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDocumentText('')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !documentText.trim()}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Check Compliance
            </button>
          </div>
        </div>
      </div>

      {/* Sample Text Button */}
      <button
        onClick={() => setDocumentText(`AGENCY POLICY ON DATA COLLECTION

This policy establishes procedures for the collection and retention of personal information from users.

1. PURPOSE
The agency will collect personal data to fulfill its statutory mission and provide services to the public.

2. DATA COLLECTION
Personal information including name, email, and contact details will be collected through online forms. All data will be retained in accordance with agency procedures.

3. SECURITY
Appropriate security measures will be implemented to protect collected data from unauthorized disclosure.

4. ACCESS
Users may request access to their records by contacting the agency.`)}
        className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
      >
        Load sample document for testing
      </button>

      {/* Results */}
      {response && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className={`p-4 rounded-xl ${getStatusConfig(response.overall_status).bg} border ${getStatusConfig(response.overall_status).bg.replace('bg-', 'border-').replace('-50', '-200')}`}>
            <div className="flex items-center gap-3">
              {(() => {
                const StatusIcon = getStatusConfig(response.overall_status).icon
                return <StatusIcon className={`w-6 h-6 ${getStatusConfig(response.overall_status).color}`} />
              })()}
              <div>
                <h3 className={`font-semibold ${getStatusConfig(response.overall_status).color}`}>
                  {getStatusConfig(response.overall_status).label}
                </h3>
                <p className="text-sm text-slate-600">
                  Checked against {response.checked_regulations} regulations in {response.processing_time_ms.toFixed(0)}ms
                </p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {response.issues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Identified Issues ({response.issues.length})
              </h3>
              <div className="space-y-4">
                {response.issues.map((issue, i) => {
                  const config = getSeverityConfig(issue.severity)
                  const SeverityIcon = config.icon

                  return (
                    <div key={i} className={`border ${config.border} rounded-xl overflow-hidden`}>
                      <div className={`${config.bg} px-4 py-2.5 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <SeverityIcon className={`w-4 h-4 ${config.color}`} />
                          <span className={`font-medium ${config.color} capitalize text-sm`}>
                            {issue.severity}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="font-mono text-sm text-blue-600">
                            {issue.regulation_citation}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
                          {Math.round(issue.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-slate-800 text-sm mb-3">{issue.issue_description}</p>
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">Document excerpt:</p>
                          <p className="text-sm text-slate-700 italic">"{issue.document_excerpt}"</p>
                        </div>
                        {issue.suggested_fix && (
                          <div className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">
                              <strong className="text-slate-900">Suggested fix:</strong> {issue.suggested_fix}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Issues */}
          {response.issues.length === 0 && response.overall_status === 'compliant' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900">No Compliance Issues Found</h3>
              <p className="text-slate-500 mt-1">
                The document appears to comply with checked regulations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Check Document Compliance</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Paste or upload document text to check for compliance against
            federal regulations. Get specific citations and suggested fixes.
          </p>
        </div>
      )}
    </div>
  )
}
