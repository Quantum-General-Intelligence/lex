'use client'

import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Sparkles, BookOpen, GitBranch, Database } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { API_BASE_URL } from '@/lib/api'

interface UploadedFile {
  name: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  message?: string
  result?: {
    document_id: string
    title: string
    document_type: string
    chunks_created: number
    citations_found: number
    citations?: Array<{ type: string; full_citation: string }>
    agencies_mentioned: string[]
    summary: string
    graph_node_created: boolean
  }
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      // Add file to list with pending status
      const uploadFile: UploadedFile = {
        name: file.name,
        size: file.size,
        status: 'pending',
      }
      setFiles((prev) => [...prev, uploadFile])

      // Start processing
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name && f.status === 'pending' ? { ...f, status: 'processing' } : f))
        )
      }, 100)

      // Upload and process
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${API_BASE_URL}/api/documents/ingest`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const result = await res.json()
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? {
                    ...f,
                    status: 'completed',
                    message: `Indexed ${result.chunks_created} chunks, found ${result.citations_found} citations`,
                    result,
                  }
                : f
            )
          )
        } else {
          const error = await res.json()
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, status: 'error', message: error.detail || 'Upload failed' }
                : f
            )
          )
        }
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name
              ? { ...f, status: 'error', message: 'Connection failed. Is the backend running?' }
              : f
          )
        )
      }
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const clearFiles = () => {
    setFiles([])
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={Upload}
        iconColor="text-rose-400"
        title="Ingest"
        description="Upload documents to the knowledge base"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className={`
                bg-vulcan-800 rounded-xl border-2 border-dashed p-10 text-center
                transition-all cursor-pointer
                ${isDragging ? 'border-accent bg-accent/5' : 'border-vulcan-600 hover:border-vulcan-500'}
              `}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.doc,.docx,.txt,.html"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-vulcan-700 border border-vulcan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-vulcan-400" />
                </div>
                <p className="text-lg font-medium text-white">Drop files here to upload</p>
                <p className="text-sm text-vulcan-400 mt-2">
                  PDF, Word Documents, HTML, Plain Text
                </p>
                <button className="mt-4 px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover font-medium text-sm transition-colors">
                  Select Files
                </button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6 bg-vulcan-800 rounded-xl border border-vulcan-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-vulcan-700/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Uploaded Files ({files.length})</h3>
                  <button
                    onClick={clearFiles}
                    className="text-xs text-vulcan-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="divide-y divide-vulcan-700/50">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-vulcan-700/30 cursor-pointer transition-colors ${
                        selectedFile?.name === file.name ? 'bg-accent/10' : ''
                      }`}
                      onClick={() => file.status === 'completed' && setSelectedFile(file)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-vulcan-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-vulcan-500">
                            {formatSize(file.size)}
                            {file.message && file.status !== 'error' && (
                              <span className="ml-2 text-vulcan-400">• {file.message}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'pending' && (
                          <span className="text-xs text-vulcan-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                        {file.status === 'processing' && (
                          <span className="text-xs text-accent flex items-center gap-1">
                            <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            Processing
                          </span>
                        )}
                        {file.status === 'completed' && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Indexed
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs text-red-400 flex items-center gap-1" title={file.message}>
                            <XCircle className="w-3.5 h-3.5" />
                            Error
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {files.some(f => f.status === 'error') && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-300">Some files failed to process</h3>
                    <ul className="mt-2 text-sm text-red-300/80 space-y-1">
                      {files.filter(f => f.status === 'error').map((f, i) => (
                        <li key={i}>{f.name}: {f.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Selected File Details */}
            {selectedFile?.result && (
              <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Processing Results
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-vulcan-500">Title</p>
                    <p className="text-sm font-medium text-white">{selectedFile.result.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-vulcan-500">Document Type</p>
                    <p className="text-sm text-vulcan-300 capitalize">{selectedFile.result.document_type.replace('_', ' ')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-vulcan-900/50 rounded-lg p-2">
                      <p className="text-xs text-vulcan-500">Chunks</p>
                      <p className="text-lg font-semibold text-white">{selectedFile.result.chunks_created}</p>
                    </div>
                    <div className="bg-vulcan-900/50 rounded-lg p-2">
                      <p className="text-xs text-vulcan-500">Citations</p>
                      <p className="text-lg font-semibold text-white">{selectedFile.result.citations_found}</p>
                    </div>
                  </div>
                  {selectedFile.result.citations && selectedFile.result.citations.length > 0 && (
                    <div>
                      <p className="text-xs text-vulcan-500 mb-1">Detected Citations</p>
                      <div className="space-y-1">
                        {selectedFile.result.citations.slice(0, 5).map((cit, i) => (
                          <p key={i} className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                            {cit.full_citation}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedFile.result.agencies_mentioned.length > 0 && (
                    <div>
                      <p className="text-xs text-vulcan-500 mb-1">Agencies Mentioned</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedFile.result.agencies_mentioned.map((agency, i) => (
                          <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            {agency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-vulcan-700/50 flex items-center gap-4 text-xs">
                    <span className={`flex items-center gap-1 ${selectedFile.result.graph_node_created ? 'text-emerald-400' : 'text-vulcan-500'}`}>
                      <GitBranch className="w-3.5 h-3.5" />
                      Graph node {selectedFile.result.graph_node_created ? 'created' : 'failed'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Database className="w-3.5 h-3.5" />
                      Vector indexed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Info */}
            <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Document Processing</h3>
              <ul className="space-y-2.5 text-xs text-vulcan-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Text extraction and parsing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Automatic citation detection
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Vector embedding generation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Knowledge graph integration
                </li>
              </ul>
            </div>

            {/* Supported Formats */}
            <div className="bg-vulcan-800/30 border border-vulcan-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-vulcan-400" />
                Supported Formats
              </h3>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOCX', 'DOC', 'HTML', 'TXT'].map(format => (
                  <span key={format} className="text-xs bg-vulcan-900/50 border border-vulcan-700/50 px-2 py-1 rounded text-vulcan-300">
                    .{format.toLowerCase()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-vulcan-500 mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
