import { Scale, ScrollText, Gavel, FileText, Building2 } from 'lucide-react'

// Legal document type colors - used across graph, documents list, badges
export const NODE_COLORS: Record<string, string> = {
  Statute: '#3b82f6',        // Blue
  Regulation: '#8b5cf6',     // Purple
  CaseLaw: '#10b981',        // Emerald
  ExecutiveOrder: '#ef4444', // Red
  Agency: '#f59e0b',         // Amber
  Guidance: '#06b6d4',       // Cyan
}

// Tailwind class variants for badges/chips
export const NODE_COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  Statute: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Regulation: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  CaseLaw: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  ExecutiveOrder: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Agency: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Guidance: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
}

// Icons for each node type
export const NODE_ICONS: Record<string, typeof Scale> = {
  Statute: Scale,
  Regulation: ScrollText,
  CaseLaw: Gavel,
  ExecutiveOrder: FileText,
  Agency: Building2,
  Guidance: FileText,
}

// Relationship type display labels
export const RELATIONSHIP_LABELS: Record<string, string> = {
  AUTHORIZES: 'Authorizes',
  IMPLEMENTS: 'Implements',
  CITES: 'Cites',
  INTERPRETS: 'Interprets',
  OVERRULES: 'Overrules',
  AMENDS: 'Amends',
  REGULATES: 'Regulates',
  ENFORCES: 'Enforces',
  ESTABLISHES: 'Establishes',
  CONSTRAINS: 'Constrains',
  SUPPLEMENTS: 'Supplements',
  RELATES_TO: 'Relates to',
  PROMULGATES: 'Promulgates',
  ADMINISTERS: 'Administers',
}

// All legal document types
export const LEGAL_NODE_TYPES = [
  'Statute',
  'Regulation',
  'CaseLaw',
  'ExecutiveOrder',
  'Agency',
  'Guidance',
] as const

export type LegalNodeType = typeof LEGAL_NODE_TYPES[number]
