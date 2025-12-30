'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, X, ArrowRight, ArrowLeft, FileText, ChevronRight, Link2, Search, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { NODE_COLORS, NODE_ICONS, RELATIONSHIP_LABELS } from '@/constants/legalNodeConfig'
import { DEMO_GRAPH_DATA, DEMO_NODE_DETAILS } from '@/constants/demoData'
import { API_BASE_URL } from '@/lib/api'
import { NodeDetailsSkeleton, GraphSkeleton } from '@/components/Skeleton'

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

// Use shared demo data
const DEMO_DATA: GraphData = DEMO_GRAPH_DATA

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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GraphNode[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const graphRef = useRef<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const fetchGraphData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/graph/explore?limit=50`)
      if (res.ok) {
        const data = await res.json()
        if (data.nodes?.length > 0) {
          setGraphData({
            nodes: data.nodes,
            links: data.relationships || [],
          })
        }
      }
    } catch {
      // Use demo data on error (already set as default)
    } finally {
      setLoading(false)
    }
  }

  const fetchNodeDetails = async (nodeId: string) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/graph/nodes/${nodeId}/details`)
      if (res.ok) {
        const data = await res.json()
        setNodeDetails(data)
        setLoadingDetails(false)
        return
      }
    } catch {
      // Use demo data on error
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
      const res = await fetch(`${API_BASE_URL}/api/graph/nodes/${nodeId}/authority-chain`)
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const results = graphData.nodes.filter(
        node =>
          node.title.toLowerCase().includes(query) ||
          node.citation?.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
      )
      setSearchResults(results.slice(0, 10))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, graphData.nodes])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close panels or search
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false)
          setSearchQuery('')
        } else if (selectedNode) {
          handleCloseDetails()
        }
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      // Cmd/Ctrl + F to fit view
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !showSearch) {
        e.preventDefault()
        handleFitView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, selectedNode])

  const handleSearchSelect = (node: GraphNode) => {
    setShowSearch(false)
    setSearchQuery('')
    setSelectedNode(node)
    fetchNodeDetails(node.id)
    fetchAuthorityChain(node.id, node.type)
    if (graphRef.current && node.x !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 1000)
      graphRef.current.zoom(2, 1000)
    }
  }

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
    <div className="flex flex-col lg:flex-row gap-4 w-full relative">
      {/* Graph Container */}
      <div className={`flex-1 min-w-0 space-y-4 ${selectedNode ? 'lg:max-w-[60%]' : ''}`}>
        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="text-sm font-semibold text-white">Knowledge Graph</h3>
            <span className="text-xs text-vulcan-400 hidden sm:inline">
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
            <button
              onClick={() => {
                setShowSearch(true)
                setTimeout(() => searchInputRef.current?.focus(), 100)
              }}
              className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors group"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4 text-vulcan-400 group-hover:text-white" />
            </button>
            <button onClick={handleZoomOut} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors">
              <ZoomOut className="w-4 h-4 text-vulcan-400" />
            </button>
            <button onClick={handleZoomIn} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors">
              <ZoomIn className="w-4 h-4 text-vulcan-400" />
            </button>
            <button onClick={handleFitView} className="p-2 hover:bg-vulcan-700 rounded-lg transition-colors" title="Fit to view (⌘F)">
              <Maximize2 className="w-4 h-4 text-vulcan-400" />
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute inset-0 z-50 bg-vulcan-900/80 backdrop-blur-sm flex items-start justify-center pt-20">
            <div className="w-full max-w-lg bg-vulcan-800 rounded-xl border border-vulcan-700 shadow-xl">
              <div className="flex items-center gap-3 p-3 border-b border-vulcan-700">
                <Search className="w-5 h-5 text-vulcan-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search nodes by title, citation, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-vulcan-500 outline-none"
                />
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-vulcan-400 bg-vulcan-700 rounded">ESC</kbd>
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleSearchSelect(node)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-vulcan-700/50 transition-colors text-left"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: NODE_COLORS[node.type] || '#64748b' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{node.title}</p>
                        <p className="text-xs text-vulcan-400">
                          {node.type}{node.citation ? ` • ${node.citation}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="p-6 text-center text-vulcan-400 text-sm">
                  No nodes found matching &quot;{searchQuery}&quot;
                </div>
              )}
              {!searchQuery && (
                <div className="p-4 text-center text-vulcan-500 text-sm">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
        )}

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
        <div className="fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto lg:w-[40%] lg:min-w-[350px] bg-vulcan-800 lg:bg-vulcan-800/50 backdrop-blur-sm lg:rounded-xl border-l lg:border border-vulcan-700/50 overflow-hidden flex flex-col h-full lg:h-[calc(100vh-320px)] lg:min-h-[400px] lg:max-h-[700px]">
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
              <NodeDetailsSkeleton />
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
