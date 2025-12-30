'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, File } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

interface UploadResult {
  status: string
  document_id: string
  title: string
  document_type: string
  chunks_created: number
  citations_found: number
  citations: Array<{ type: string; full_citation: string }>
  agencies_mentioned: string[]
  summary: string
  graph_node_created: boolean
  text_length: number
}

interface DocumentUploadProps {
  onUploadComplete?: (result: UploadResult) => void
  onClose?: () => void
}

const ALLOWED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.html', '.htm']

export function DocumentUpload({ onUploadComplete, onClose }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [jurisdiction, setJurisdiction] = useState('federal')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}`)
      return
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.')
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (documentType) formData.append('document_type', documentType)
    formData.append('jurisdiction', jurisdiction)

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/ingest`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Upload failed')
      }

      const data = await res.json()
      setResult(data)
      onUploadComplete?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setTitle('')
    setDocumentType('')
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8" />
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-400" />
    if (ext === 'docx' || ext === 'doc') return <FileText className="w-8 h-8 text-blue-400" />
    return <File className="w-8 h-8 text-vulcan-400" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!result && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-accent bg-accent/5'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-vulcan-600 hover:border-vulcan-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                file ? 'bg-emerald-500/10 text-emerald-400' : 'bg-vulcan-700 text-vulcan-400'
              }`}>
                {getFileIcon()}
              </div>

              {file ? (
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-vulcan-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={resetUpload}
                    className="mt-3 text-sm text-vulcan-400 hover:text-red-400 flex items-center gap-1 mx-auto"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-white">Drop your document here</p>
                  <p className="text-sm text-vulcan-400 mt-1">or</p>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-vulcan-700 hover:bg-vulcan-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-vulcan-500 mt-4">
                    Supports: PDF, DOCX, DOC, TXT, HTML (max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Fields */}
          {file && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-vulcan-200 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Auto-detected from document"
                  className="w-full px-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-vulcan-200 mb-2">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-vulcan-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  >
                    <option value="">Auto-detect</option>
                    <option value="statute">Statute</option>
                    <option value="regulation">Regulation</option>
                    <option value="case_law">Case Law</option>
                    <option value="executive_order">Executive Order</option>
                    <option value="guidance">Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-vulcan-200 mb-2">
                    Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-4 py-2.5 bg-vulcan-900 border border-vulcan-600 rounded-lg text-vulcan-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  >
                    <option value="federal">Federal</option>
                    <option value="state">State</option>
                    <option value="local">Local</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Process
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={resetUpload}
              className="text-xs text-red-400 hover:text-red-300 mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-semibold text-emerald-400">Document Processed Successfully</h4>
                <p className="text-sm text-vulcan-300 mt-0.5">{result.title}</p>
              </div>
            </div>
          </div>

          {/* Processing Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-vulcan-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{result.chunks_created}</p>
              <p className="text-xs text-vulcan-400">Chunks Created</p>
            </div>
            <div className="bg-vulcan-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{result.citations_found}</p>
              <p className="text-xs text-vulcan-400">Citations Found</p>
            </div>
            <div className="bg-vulcan-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{result.agencies_mentioned.length}</p>
              <p className="text-xs text-vulcan-400">Agencies</p>
            </div>
            <div className="bg-vulcan-800/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {result.graph_node_created ? '1' : '0'}
              </p>
              <p className="text-xs text-vulcan-400">Graph Nodes</p>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="bg-vulcan-800/50 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide mb-2">
                Summary
              </h5>
              <p className="text-sm text-vulcan-200 line-clamp-4">{result.summary}</p>
            </div>
          )}

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="bg-vulcan-800/50 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide mb-2">
                Extracted Citations
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.citations.slice(0, 10).map((cit, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-accent/10 border border-accent/20 text-accent text-xs rounded-full font-mono"
                  >
                    {cit.full_citation}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetUpload}
              className="flex-1 py-2.5 bg-vulcan-700 hover:bg-vulcan-600 text-white rounded-lg font-medium transition-colors"
            >
              Upload Another
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
