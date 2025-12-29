'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, X, ArrowRight, ArrowLeft, FileText, Scale, Building2, Gavel, ScrollText, Loader2, ChevronRight, Link2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  title: string
  citation?: string
  type: string
  jurisdiction?: string
  // These are added by react-force-graph at runtime
  x?: number
  y?: number
}

interface GraphLink {
  source: string
  target: string
  type: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface NodeDetails {
  id: string
  type: string
  title: string
  citation?: string
  jurisdiction?: string
  agency?: string
  year?: number
  court?: string
  summary?: string
  text?: string
  abbreviation?: string
  relationships: {
    type: string
    direction: 'incoming' | 'outgoing'
    node: {
      id: string
      title: string
      citation?: string
      type: string
    }
  }[]
}

// Demo data for visualization
const DEMO_DATA: GraphData = {
  nodes: [
    { id: '1', title: 'Administrative Procedure Act', citation: '5 U.S.C. § 551-559', type: 'Statute', jurisdiction: 'federal' },
    { id: '2', title: 'FOIA', citation: '5 U.S.C. § 552', type: 'Statute', jurisdiction: 'federal' },
    { id: '3', title: 'Privacy Act', citation: '5 U.S.C. § 552a', type: 'Statute', jurisdiction: 'federal' },
    { id: '4', title: 'OMB Circular A-130', citation: 'OMB A-130', type: 'Regulation', jurisdiction: 'federal' },
    { id: '5', title: 'NIST SP 800-53', citation: 'NIST 800-53', type: 'Guidance', jurisdiction: 'federal' },
    { id: '6', title: 'FERPA', citation: '20 U.S.C. § 1232g', type: 'Statute', jurisdiction: 'federal' },
    { id: '7', title: 'Dept. of Education', type: 'Agency', jurisdiction: 'federal' },
    { id: '8', title: '34 CFR Part 99', citation: '34 CFR 99', type: 'Regulation', jurisdiction: 'federal' },
    { id: '9', title: 'Student Privacy Rule', type: 'Regulation', jurisdiction: 'federal' },
    { id: '10', title: 'HIPAA', citation: '42 U.S.C. § 1320d', type: 'Statute', jurisdiction: 'federal' },
  ],
  links: [
    { source: '1', target: '4', type: 'AUTHORIZES' },
    { source: '2', target: '4', type: 'AUTHORIZES' },
    { source: '3', target: '4', type: 'AUTHORIZES' },
    { source: '4', target: '5', type: 'IMPLEMENTS' },
    { source: '6', target: '8', type: 'AUTHORIZES' },
    { source: '7', target: '8', type: 'REGULATES' },
    { source: '8', target: '9', type: 'IMPLEMENTS' },
    { source: '6', target: '9', type: 'AUTHORIZES' },
    { source: '3', target: '10', type: 'CITES' },
  ],
}

// Demo node details
const DEMO_NODE_DETAILS: Record<string, Omit<NodeDetails, 'relationships'>> = {
  '1': {
    id: '1',
    type: 'Statute',
    title: 'Administrative Procedure Act',
    citation: '5 U.S.C. § 551-559',
    jurisdiction: 'federal',
    year: 1946,
    summary: 'The APA governs the process by which federal agencies develop and issue regulations. It includes requirements for publishing notices of proposed and final rulemaking in the Federal Register, and provides opportunities for the public to comment on notices of proposed rulemaking.',
    text: 'For the purpose of this subchapter—(1) "agency" means each authority of the Government of the United States, whether or not it is within or subject to review by another agency...',
  },
  '2': {
    id: '2',
    type: 'Statute',
    title: 'Freedom of Information Act',
    citation: '5 U.S.C. § 552',
    jurisdiction: 'federal',
    year: 1967,
    summary: 'FOIA provides the public the right to request access to records from any federal agency. Federal agencies are required to disclose any information requested under FOIA unless it falls under one of nine exemptions.',
    text: 'Each agency shall make available to the public information as follows: (1) Each agency shall separately state and currently publish in the Federal Register for the guidance of the public...',
  },
  '3': {
    id: '3',
    type: 'Statute',
    title: 'Privacy Act of 1974',
    citation: '5 U.S.C. § 552a',
    jurisdiction: 'federal',
    year: 1974,
    summary: 'The Privacy Act establishes a code of fair information practices that governs the collection, maintenance, use, and dissemination of information about individuals maintained in systems of records by federal agencies.',
    text: 'Each agency that maintains a system of records shall maintain in its records only such information about an individual as is relevant and necessary to accomplish a purpose of the agency...',
  },
  '4': {
    id: '4',
    type: 'Regulation',
    title: 'OMB Circular A-130',
    citation: 'OMB A-130',
    jurisdiction: 'federal',
    agency: 'Office of Management and Budget',
    year: 2016,
    summary: 'Establishes general policy for the planning, budgeting, governance, acquisition, and management of federal information, personnel, equipment, funds, IT resources and supporting infrastructure.',
    text: 'This Circular establishes policy for the management of Federal information resources. OMB includes procedural and analytic guidelines for implementing specific aspects of these policies as appendices.',
  },
  '5': {
    id: '5',
    type: 'Guidance',
    title: 'NIST Special Publication 800-53',
    citation: 'NIST 800-53',
    jurisdiction: 'federal',
    agency: 'National Institute of Standards and Technology',
    year: 2020,
    summary: 'Provides a catalog of security and privacy controls for federal information systems and organizations to protect organizational operations, assets, individuals, and the Nation from a diverse set of threats.',
  },
  '6': {
    id: '6',
    type: 'Statute',
    title: 'Family Educational Rights and Privacy Act',
    citation: '20 U.S.C. § 1232g',
    jurisdiction: 'federal',
    year: 1974,
    summary: 'FERPA protects the privacy of student education records. It applies to all schools that receive funds under an applicable program of the U.S. Department of Education.',
    text: 'No funds shall be made available under any applicable program to any educational agency or institution which has a policy or practice of permitting the release of education records...',
  },
  '7': {
    id: '7',
    type: 'Agency',
    title: 'U.S. Department of Education',
    jurisdiction: 'federal',
    abbreviation: 'ED',
    year: 1979,
    summary: 'The Department of Education is the agency of the federal government that establishes policy for, administers and coordinates most federal assistance to education.',
  },
  '8': {
    id: '8',
    type: 'Regulation',
    title: 'FERPA Regulations',
    citation: '34 CFR Part 99',
    jurisdiction: 'federal',
    agency: 'Department of Education',
    year: 1988,
    summary: 'Implements FERPA requirements. Defines education records, establishes procedures for access and amendment, and specifies conditions for disclosure of personally identifiable information.',
  },
  '9': {
    id: '9',
    type: 'Regulation',
    title: 'Student Privacy Protection Rule',
    jurisdiction: 'federal',
    agency: 'Department of Education',
    year: 2011,
    summary: 'Strengthens FERPA protections by limiting the circumstances under which student education records can be disclosed without consent.',
  },
  '10': {
    id: '10',
    type: 'Statute',
    title: 'Health Insurance Portability and Accountability Act',
    citation: '42 U.S.C. § 1320d',
    jurisdiction: 'federal',
    year: 1996,
    summary: 'HIPAA establishes national standards to protect sensitive patient health information from being disclosed without patient consent or knowledge.',
    text: 'The Secretary shall adopt standards for transactions, and data elements for such transactions, to enable health information to be exchanged electronically...',
  },
}

const NODE_COLORS: Record<string, string> = {
  Statute: '#3b82f6',      // Blue
  Regulation: '#8b5cf6',   // Purple
  CaseLaw: '#10b981',      // Emerald
  ExecutiveOrder: '#ef4444', // Red
  Agency: '#f59e0b',       // Amber
  Guidance: '#06b6d4',     // Cyan
}

const NODE_ICONS: Record<string, any> = {
  Statute: Scale,
  Regulation: ScrollText,
  CaseLaw: Gavel,
  ExecutiveOrder: FileText,
  Agency: Building2,
}

const RELATIONSHIP_LABELS: Record<string, string> = {
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
}

interface AuthorityChainNode {
  id: string
  title: string
  citation?: string
  type: string
}

export function GraphViewer() {
  const [graphData, setGraphData] = useState<GraphData>(DEMO_DATA)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authorityChain, setAuthorityChain] = useState<AuthorityChainNode[]>([])
  const [loadingChain, setLoadingChain] = useState(false)
  const graphRef = useRef<any>(null)

  const fetchGraphData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/explore?limit=50`)
      if (res.ok) {
        const data = await res.json()
        if (data.nodes?.length > 0) {
          setGraphData({
            nodes: data.nodes,
            links: data.relationships || [],
          })
        }
      }
    } catch (err) {
      // Use demo data on error
      console.log('Using demo graph data')
    } finally {
      setLoading(false)
    }
  }

  const fetchNodeDetails = async (nodeId: string) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/nodes/${nodeId}/details`)
      if (res.ok) {
        const data = await res.json()
        setNodeDetails(data)
        return
      }
    } catch (err) {
      console.log('Using demo node details')
    }

    // Fallback to demo data
    const demoDetails = DEMO_NODE_DETAILS[nodeId]
    if (demoDetails) {
      // Build relationships from DEMO_DATA links
      const relationships: NodeDetails['relationships'] = []

      for (const link of DEMO_DATA.links) {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

        if (sourceId === nodeId) {
          const targetNode = DEMO_DATA.nodes.find(n => n.id === targetId)
          if (targetNode) {
            relationships.push({
              type: link.type,
              direction: 'outgoing',
              node: {
                id: targetNode.id,
                title: targetNode.title,
                citation: targetNode.citation,
                type: targetNode.type,
              },
            })
          }
        } else if (targetId === nodeId) {
          const sourceNode = DEMO_DATA.nodes.find(n => n.id === sourceId)
          if (sourceNode) {
            relationships.push({
              type: link.type,
              direction: 'incoming',
              node: {
                id: sourceNode.id,
                title: sourceNode.title,
                citation: sourceNode.citation,
                type: sourceNode.type,
              },
            })
          }
        }
      }

      setNodeDetails({
        ...demoDetails,
        relationships,
      })
    } else {
      setNodeDetails(null)
    }
    setLoadingDetails(false)
  }

  const fetchAuthorityChain = async (nodeId: string, nodeType: string) => {
    // Only fetch authority chain for regulations and guidance
    if (!['Regulation', 'Guidance'].includes(nodeType)) {
      setAuthorityChain([])
      return
    }

    setLoadingChain(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/graph/nodes/${nodeId}/authority-chain`)
      if (res.ok) {
        const data = await res.json()
        setAuthorityChain(data.authority_chain || [])
      } else {
        // Generate demo authority chain based on graph links
        const chain = buildDemoAuthorityChain(nodeId)
        setAuthorityChain(chain)
      }
    } catch (err) {
      // Generate demo authority chain based on graph links
      const chain = buildDemoAuthorityChain(nodeId)
      setAuthorityChain(chain)
    } finally {
      setLoadingChain(false)
    }
  }

  // Build authority chain from demo data by traversing AUTHORIZES relationships backwards
  const buildDemoAuthorityChain = (nodeId: string): AuthorityChainNode[] => {
    const chain: AuthorityChainNode[] = []
    const visited = new Set<string>()

    const findAuthorities = (currentId: string) => {
      if (visited.has(currentId)) return
      visited.add(currentId)

      // Find all nodes that AUTHORIZE this node
      const authorizingLinks = graphData.links.filter(
        link => {
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id
          return targetId === currentId && link.type === 'AUTHORIZES'
        }
      )

      for (const link of authorizingLinks) {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
        const sourceNode = graphData.nodes.find(n => n.id === sourceId)
        if (sourceNode) {
          chain.unshift({
            id: sourceNode.id,
            title: sourceNode.title,
            citation: sourceNode.citation,
            type: sourceNode.type,
          })
          findAuthorities(sourceId)
        }
      }
    }

    findAuthorities(nodeId)
    return chain
  }

  useEffect(() => {
    fetchGraphData()
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode)
    fetchNodeDetails(node.id)
    fetchAuthorityChain(node.id, node.type)
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000)
      graphRef.current.zoom(2, 1000)
    }
  }, [graphData])

  const handleRelationshipNodeClick = (nodeId: string) => {
    // Find the node in graph data and select it
    const node = graphData.nodes.find(n => n.id === nodeId)
    if (node) {
      setSelectedNode(node)
      fetchNodeDetails(nodeId)
      fetchAuthorityChain(nodeId, node.type)
      // Center on the node if it has coordinates
      if (graphRef.current && (node as any).x !== undefined) {
        graphRef.current.centerAt((node as any).x, (node as any).y, 1000)
        graphRef.current.zoom(2, 1000)
      }
    }
  }

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.5, 300)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.5, 300)
    }
  }

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }

  const handleCloseDetails = () => {
    setSelectedNode(null)
    setNodeDetails(null)
    setAuthorityChain([])
  }

  // Group relationships by type
  const groupedRelationships = nodeDetails?.relationships.reduce((acc, rel) => {
    const key = `${rel.type}-${rel.direction}`
    if (!acc[key]) {
      acc[key] = { type: rel.type, direction: rel.direction, nodes: [] }
    }
    acc[key].nodes.push(rel.node)
    return acc
  }, {} as Record<string, { type: string; direction: 'incoming' | 'outgoing'; nodes: typeof nodeDetails.relationships[0]['node'][] }>) || {}

  const NodeIcon = selectedNode ? NODE_ICONS[selectedNode.type] || FileText : FileText

  return (
    <div className="flex gap-4">
      {/* Graph Container */}
      <div className={`flex-1 space-y-4 ${selectedNode ? 'max-w-[60%]' : ''}`}>
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white">Knowledge Graph</h3>
            <span className="text-xs text-vulcan-400">
              {graphData.nodes.length} nodes, {graphData.links.length} relationships
            </span>
            <button
              onClick={fetchGraphData}
              disabled={loading}
              className="p-1.5 text-vulcan-400 hover:text-white hover:bg-vulcan-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleZoomOut} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors">
              <ZoomOut className="w-4 h-4 text-vulcan-400" />
            </button>
            <button onClick={handleZoomIn} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors">
              <ZoomIn className="w-4 h-4 text-vulcan-400" />
            </button>
            <button onClick={handleFitView} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4 text-vulcan-400" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-vulcan-300">{type}</span>
            </div>
          ))}
        </div>

        {/* Graph */}
        <div className="graph-container h-[calc(100vh-320px)] min-h-[400px] max-h-[700px] relative rounded-xl overflow-hidden border border-vulcan-700/50 bg-vulcan-900">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.title}${node.citation ? ` (${node.citation})` : ''}`}
            nodeColor={(node: any) => NODE_COLORS[node.type] || '#64748b'}
            nodeRelSize={6}
            linkColor={() => '#4a5568'}
            linkWidth={1.5}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            linkLabel={(link: any) => link.type}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            backgroundColor="#0a0e1a"
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.title?.substring(0, 18) || ''
              const fontSize = 11 / globalScale
              ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`
              ctx.fillStyle = NODE_COLORS[node.type] || '#64748b'
              ctx.beginPath()
              ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI)
              ctx.fill()

              // Highlight selected node
              if (selectedNode && node.id === selectedNode.id) {
                ctx.strokeStyle = NODE_COLORS[node.type] || '#64748b'
                ctx.lineWidth = 3 / globalScale
                ctx.beginPath()
                ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI)
                ctx.stroke()
              } else {
                ctx.strokeStyle = '#1c2333'
                ctx.lineWidth = 1.5 / globalScale
                ctx.stroke()
              }

              if (globalScale > 0.7) {
                ctx.textAlign = 'center'
                ctx.textBaseline = 'top'
                ctx.fillStyle = '#a0aec0'
                ctx.fillText(label, node.x, node.y + 10)
              }
            }}
          />
        </div>
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="w-[40%] min-w-[350px] bg-vulcan-800/50 backdrop-blur-sm rounded-xl border border-vulcan-700/50 overflow-hidden flex flex-col h-[calc(100vh-320px)] min-h-[400px] max-h-[700px]">
          {/* Header */}
          <div className="p-4 border-b border-vulcan-700/50 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${NODE_COLORS[selectedNode.type]}15` }}
              >
                <NodeIcon className="w-5 h-5" style={{ color: NODE_COLORS[selectedNode.type] }} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-white leading-tight">{selectedNode.title}</h4>
                {(nodeDetails?.citation || selectedNode.citation) && (
                  <p className="text-sm font-mono text-accent mt-0.5">{nodeDetails?.citation || selectedNode.citation}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${NODE_COLORS[selectedNode.type]}15`,
                      color: NODE_COLORS[selectedNode.type],
                    }}
                  >
                    {selectedNode.type}
                  </span>
                  {nodeDetails?.year && (
                    <span className="text-xs text-vulcan-400">{nodeDetails.year}</span>
                  )}
                  {nodeDetails?.agency && (
                    <span className="text-xs text-vulcan-400">{nodeDetails.agency}</span>
                  )}
                  {nodeDetails?.court && (
                    <span className="text-xs text-vulcan-400">{nodeDetails.court}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseDetails}
              className="p-1.5 text-vulcan-400 hover:text-white hover:bg-vulcan-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Authority Chain */}
          {(authorityChain.length > 0 || loadingChain) && (
            <div className="px-4 py-3 border-b border-vulcan-700/50 bg-vulcan-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-3.5 h-3.5 text-accent" />
                <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide">Authority Chain</h5>
              </div>
              {loadingChain ? (
                <div className="flex items-center gap-2 text-vulcan-500 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center flex-wrap gap-1">
                  {authorityChain.map((node, idx) => (
                    <div key={node.id} className="flex items-center">
                      <button
                        onClick={() => handleRelationshipNodeClick(node.id)}
                        className="px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-vulcan-700"
                        style={{
                          backgroundColor: `${NODE_COLORS[node.type]}15`,
                          color: NODE_COLORS[node.type],
                        }}
                      >
                        {node.citation || node.title.substring(0, 20)}
                      </button>
                      {idx < authorityChain.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-vulcan-600 mx-0.5" />
                      )}
                    </div>
                  ))}
                  {authorityChain.length > 0 && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-vulcan-600 mx-0.5" />
                      <span
                        className="px-2 py-1 rounded text-xs font-medium border-2"
                        style={{
                          borderColor: NODE_COLORS[selectedNode.type],
                          color: NODE_COLORS[selectedNode.type],
                        }}
                      >
                        {selectedNode.citation || selectedNode.title.substring(0, 20)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loadingDetails ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-vulcan-400" />
                <p className="text-sm text-vulcan-400 mt-2">Loading details...</p>
              </div>
            ) : nodeDetails ? (
              <div className="divide-y divide-vulcan-700/50">
                {/* Summary */}
                {nodeDetails.summary && (
                  <div className="p-4">
                    <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide mb-2">Summary</h5>
                    <p className="text-sm text-vulcan-200 leading-relaxed">{nodeDetails.summary}</p>
                  </div>
                )}

                {/* Full Text (collapsible or truncated) */}
                {nodeDetails.text && (
                  <div className="p-4">
                    <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide mb-2">Full Text</h5>
                    <div className="text-sm text-vulcan-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto bg-vulcan-900/50 rounded-lg p-3 border border-vulcan-700/50">
                      {nodeDetails.text}
                    </div>
                  </div>
                )}

                {/* Relationships */}
                {nodeDetails.relationships.length > 0 && (
                  <div className="p-4">
                    <h5 className="text-xs font-semibold text-vulcan-400 uppercase tracking-wide mb-3">
                      Relationships ({nodeDetails.relationships.length})
                    </h5>
                    <div className="space-y-3">
                      {Object.values(groupedRelationships).map((group, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-2">
                            {group.direction === 'outgoing' ? (
                              <ArrowRight className="w-3.5 h-3.5 text-vulcan-500" />
                            ) : (
                              <ArrowLeft className="w-3.5 h-3.5 text-vulcan-500" />
                            )}
                            <span className="text-xs font-medium text-vulcan-300">
                              {group.direction === 'outgoing' ? '' : 'Is '}{RELATIONSHIP_LABELS[group.type] || group.type}{group.direction === 'incoming' ? ' by' : ''}
                            </span>
                          </div>
                          <div className="space-y-1.5 ml-5">
                            {group.nodes.map((relNode, nodeIdx) => (
                              <button
                                key={nodeIdx}
                                onClick={() => handleRelationshipNodeClick(relNode.id)}
                                className="w-full text-left p-2 rounded-lg border border-vulcan-700/50 hover:border-vulcan-600 hover:bg-vulcan-700/30 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: NODE_COLORS[relNode.type] || '#64748b' }}
                                  />
                                  <span className="text-sm text-vulcan-200 group-hover:text-accent truncate">
                                    {relNode.title}
                                  </span>
                                </div>
                                {relNode.citation && (
                                  <p className="text-xs font-mono text-vulcan-500 ml-4 mt-0.5">{relNode.citation}</p>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No relationships */}
                {nodeDetails.relationships.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-vulcan-400">No relationships mapped yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-vulcan-400">Details not available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
