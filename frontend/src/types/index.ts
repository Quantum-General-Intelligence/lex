// Document types
export type DocumentType =
  | 'statute'
  | 'regulation'
  | 'case_law'
  | 'executive_order'
  | 'guidance'
  | 'public_comment'

export type LegalNodeType =
  | 'Statute'
  | 'Regulation'
  | 'CaseLaw'
  | 'ExecutiveOrder'
  | 'Agency'

export type RelationshipType =
  | 'AUTHORIZES'
  | 'IMPLEMENTS'
  | 'CITES'
  | 'OVERTURNS'
  | 'SUPERSEDES'
  | 'AMENDS'
  | 'REGULATES'
  | 'CONFLICTS_WITH'

// API Response types
export interface Document {
  id: string
  title: string
  document_type: DocumentType
  citation?: string
  jurisdiction?: string
  agency?: string
  effective_date?: string
  source_url?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LegalNode {
  id: string
  node_type: LegalNodeType
  title: string
  citation?: string
  jurisdiction: string
  agency?: string
  effective_date?: string
  summary?: string
  source_url?: string
  metadata: Record<string, any>
  relationship_count: number
}

export interface Citation {
  document_id: string
  document_title: string
  citation?: string
  chunk_text: string
  relevance_score: number
  page_or_section?: string
}

export interface QueryResponse {
  query: string
  answer: string
  confidence_score: number
  citations: Citation[]
  chain_of_thought?: string
  related_nodes: string[]
  ambiguity_flags: string[]
  processing_time_ms: number
}

export interface ComplianceIssue {
  severity: 'critical' | 'warning' | 'info'
  regulation_id: string
  regulation_citation: string
  issue_description: string
  document_excerpt: string
  suggested_fix?: string
  confidence: number
}

export interface ComplianceResponse {
  document_summary: string
  overall_status: 'compliant' | 'issues_found' | 'review_required'
  issues: ComplianceIssue[]
  checked_regulations: number
  processing_time_ms: number
}

export interface AuthorityChainResponse {
  regulation: LegalNode
  authority_chain: LegalNode[]
  depth: number
  explanation: string
}

export interface GraphData {
  nodes: LegalNode[]
  relationships: {
    source: LegalNode
    relationship_type: RelationshipType
    target: LegalNode
    properties: Record<string, any>
  }[]
  query_time_ms: number
}

export interface CommentAnalysis {
  comment_id: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_score: number
  topics: string[]
  key_concerns: string[]
  suggested_response_points: string[]
}

export interface CommentBatchResponse {
  total_comments: number
  sentiment_distribution: Record<string, number>
  top_topics: [string, number][]
  top_concerns: [string, number][]
  sample_analyses: CommentAnalysis[]
  processing_time_ms: number
}
