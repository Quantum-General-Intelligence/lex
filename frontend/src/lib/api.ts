import axios from 'axios'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API endpoints
export const endpoints = {
  // Health
  health: '/api/health',
  healthDetailed: '/api/health/detailed',

  // Documents
  documents: '/api/documents',
  uploadDocument: '/api/documents/upload',

  // Graph
  graphNodes: '/api/graph/nodes',
  graphExplore: '/api/graph/explore',
  authorityChain: (nodeId: string) => `/api/graph/authority-chain/${nodeId}`,

  // Query
  query: '/api/query',

  // Analysis
  compliance: '/api/analysis/compliance',
  comments: '/api/analysis/comments',
  repealCandidates: '/api/analysis/repeal-candidates',
}

// API functions
export async function queryLegalCorpus(query: string, options?: {
  topK?: number
  jurisdictionFilter?: string
  documentTypeFilter?: string
  includeGraphContext?: boolean
  explain?: boolean
}) {
  const response = await api.post(endpoints.query, {
    query,
    top_k: options?.topK || 5,
    jurisdiction_filter: options?.jurisdictionFilter,
    document_type_filter: options?.documentTypeFilter,
    include_graph_context: options?.includeGraphContext ?? true,
    explain: options?.explain ?? true,
  })
  return response.data
}

export async function checkCompliance(documentText: string, options?: {
  targetRegulations?: string[]
  jurisdiction?: string
  checkType?: 'full' | 'quick' | 'specific'
}) {
  const response = await api.post(endpoints.compliance, {
    document_text: documentText,
    target_regulations: options?.targetRegulations,
    jurisdiction: options?.jurisdiction || 'federal',
    check_type: options?.checkType || 'full',
  })
  return response.data
}

export async function exploreGraph(options?: {
  centerNodeId?: string
  depth?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (options?.centerNodeId) params.append('center_node_id', options.centerNodeId)
  if (options?.depth) params.append('depth', options.depth.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await api.get(`${endpoints.graphExplore}?${params}`)
  return response.data
}

export async function getAuthorityChain(nodeId: string, maxDepth = 5) {
  const response = await api.get(`${endpoints.authorityChain(nodeId)}?max_depth=${maxDepth}`)
  return response.data
}

export async function analyzeComments(comments: string[], regulationId?: string) {
  const response = await api.post(endpoints.comments, comments, {
    params: { regulation_id: regulationId },
  })
  return response.data
}

export async function findRepealCandidates(options?: {
  jurisdiction?: string
  agency?: string
  limit?: number
}) {
  const params = new URLSearchParams()
  if (options?.jurisdiction) params.append('jurisdiction', options.jurisdiction)
  if (options?.agency) params.append('agency', options.agency)
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await api.get(`${endpoints.repealCandidates}?${params}`)
  return response.data
}
