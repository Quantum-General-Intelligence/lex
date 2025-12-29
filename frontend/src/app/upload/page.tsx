'use client'

import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Sparkles, BookOpen, GitBranch, Database } from 'lucide-react'
import { useState } from 'react'

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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/documents/ingest`, {
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Ingest</h1>
              <p className="text-sm text-slate-500">
                Upload documents to the knowledge base
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className={`
                bg-white rounded-xl border-2 border-dashed p-10 text-center
                transition-all cursor-pointer
                ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}
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
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-700">Drop files here to upload</p>
                <p className="text-sm text-slate-500 mt-2">
                  PDF, Word Documents, HTML, Plain Text
                </p>
                <button className="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm transition-colors">
                  Select Files
                </button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Uploaded Files ({files.length})</h3>
                  <button
                    onClick={clearFiles}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedFile?.name === file.name ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => file.status === 'completed' && setSelectedFile(file)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatSize(file.size)}
                            {file.message && file.status !== 'error' && (
                              <span className="ml-2 text-slate-400">• {file.message}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'pending' && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                        {file.status === 'processing' && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            Processing
                          </span>
                        )}
                        {file.status === 'completed' && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Indexed
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-xs text-red-600 flex items-center gap-1" title={file.message}>
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
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-900">Some files failed to process</h3>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Processing Results
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Title</p>
                    <p className="text-sm font-medium text-slate-900">{selectedFile.result.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Document Type</p>
                    <p className="text-sm text-slate-700 capitalize">{selectedFile.result.document_type.replace('_', ' ')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Chunks</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedFile.result.chunks_created}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Citations</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedFile.result.citations_found}</p>
                    </div>
                  </div>
                  {selectedFile.result.citations && selectedFile.result.citations.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Detected Citations</p>
                      <div className="space-y-1">
                        {selectedFile.result.citations.slice(0, 5).map((cit, i) => (
                          <p key={i} className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {cit.full_citation}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedFile.result.agencies_mentioned.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Agencies Mentioned</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedFile.result.agencies_mentioned.map((agency, i) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            {agency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
                    <span className={`flex items-center gap-1 ${selectedFile.result.graph_node_created ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <GitBranch className="w-3.5 h-3.5" />
                      Graph node {selectedFile.result.graph_node_created ? 'created' : 'failed'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Database className="w-3.5 h-3.5" />
                      Vector indexed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Document Processing</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Text extraction and parsing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Automatic citation detection
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Vector embedding generation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Knowledge graph integration
                </li>
              </ul>
            </div>

            {/* Supported Formats */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                Supported Formats
              </h3>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOCX', 'DOC', 'HTML', 'TXT'].map(format => (
                  <span key={format} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded">
                    .{format.toLowerCase()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
