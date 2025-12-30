'use client'

import { useEffect, useRef, useMemo } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseRadius: number
  pulseSpeed: number
  pulsePhase: number
  color: string
  opacity: number
}

interface Connection {
  from: number
  to: number
  opacity: number
  width: number
}

interface ConstellationBackgroundProps {
  /** Number of nodes to render */
  nodeCount?: number
  /** Density of connections (0-1) */
  connectionDensity?: number
  /** Base opacity of the entire effect */
  opacity?: number
  /** Color scheme: 'blue' | 'purple' | 'mixed' */
  colorScheme?: 'blue' | 'purple' | 'mixed'
  /** Enable mouse interaction */
  interactive?: boolean
  /** Speed multiplier for animations */
  speed?: number
  /** Show gradient orbs in background */
  showOrbs?: boolean
  /** Show dot grid pattern */
  showGrid?: boolean
  /** Additional CSS classes */
  className?: string
}

const COLORS = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  accent: '#3b82f6',
}

export function ConstellationBackground({
  nodeCount = 25,
  connectionDensity = 0.3,
  opacity = 1,
  colorScheme = 'mixed',
  interactive = true,
  speed = 1,
  showOrbs = true,
  showGrid = true,
  className = '',
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const nodesRef = useRef<Node[]>([])
  const connectionsRef = useRef<Connection[]>([])
  const timeRef = useRef(0)

  // Generate initial nodes
  const initNodes = useMemo(() => {
    const nodes: Node[] = []
    for (let i = 0; i < nodeCount; i++) {
      const colors = colorScheme === 'blue'
        ? [COLORS.blue]
        : colorScheme === 'purple'
          ? [COLORS.purple]
          : [COLORS.blue, COLORS.purple, COLORS.cyan]

      nodes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003 * speed,
        vy: (Math.random() - 0.5) * 0.0003 * speed,
        radius: 0,
        baseRadius: 2 + Math.random() * 3,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.4,
      })
    }
    return nodes
  }, [nodeCount, colorScheme, speed])

  // Generate connections based on proximity
  const generateConnections = (nodes: Node[], width: number, height: number) => {
    const connections: Connection[] = []
    const maxDistance = Math.min(width, height) * 0.2

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = (nodes[i].x - nodes[j].x) * width
        const dy = (nodes[i].y - nodes[j].y) * height
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance && Math.random() < connectionDensity) {
          connections.push({
            from: i,
            to: j,
            opacity: (1 - distance / maxDistance) * 0.3,
            width: 0.5 + (1 - distance / maxDistance) * 1,
          })
        }
      }
    }
    return connections
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      // Regenerate connections on resize
      connectionsRef.current = generateConnections(
        nodesRef.current,
        rect.width,
        rect.height
      )
    }

    // Initialize nodes
    nodesRef.current = [...initNodes]
    resizeCanvas()

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)
      timeRef.current += 0.016 * speed

      const nodes = nodesRef.current
      const connections = connectionsRef.current
      const mouse = mouseRef.current

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Apply mouse attraction/repulsion
        if (interactive && mouse.x >= 0 && mouse.x <= 1) {
          const dx = mouse.x - node.x
          const dy = mouse.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 0.15) {
            const force = (0.15 - distance) * 0.002
            node.vx += dx * force
            node.vy += dy * force
          }
        }

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges with damping
        if (node.x < 0 || node.x > 1) {
          node.vx *= -0.8
          node.x = Math.max(0, Math.min(1, node.x))
        }
        if (node.y < 0 || node.y > 1) {
          node.vy *= -0.8
          node.y = Math.max(0, Math.min(1, node.y))
        }

        // Apply friction
        node.vx *= 0.99
        node.vy *= 0.99

        // Calculate pulse
        const pulse = Math.sin(timeRef.current * node.pulseSpeed + node.pulsePhase)
        node.radius = node.baseRadius + pulse * 1.5

        // Draw node glow
        const x = node.x * width
        const y = node.y * height

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, node.radius * 3)
        gradient.addColorStop(0, node.color + Math.floor(node.opacity * 255).toString(16).padStart(2, '0'))
        gradient.addColorStop(1, node.color + '00')

        ctx.beginPath()
        ctx.arc(x, y, node.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw node core
        ctx.beginPath()
        ctx.arc(x, y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color + Math.floor((node.opacity + 0.2) * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]

        const x1 = fromNode.x * width
        const y1 = fromNode.y * height
        const x2 = toNode.x * width
        const y2 = toNode.y * height

        // Calculate dynamic opacity based on distance
        const dx = fromNode.x - toNode.x
        const dy = fromNode.y - toNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const dynamicOpacity = Math.max(0, (0.2 - distance) / 0.2) * conn.opacity

        if (dynamicOpacity > 0.01) {
          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = fromNode.color + Math.floor(dynamicOpacity * 255).toString(16).padStart(2, '0')
          ctx.lineWidth = conn.width
          ctx.stroke()

          // Draw animated flow along connection
          const flowPos = (timeRef.current * 0.5) % 1
          const flowX = x1 + (x2 - x1) * flowPos
          const flowY = y1 + (y2 - y1) * flowPos

          const flowGradient = ctx.createRadialGradient(flowX, flowY, 0, flowX, flowY, 8)
          flowGradient.addColorStop(0, fromNode.color + Math.floor(dynamicOpacity * 200).toString(16).padStart(2, '0'))
          flowGradient.addColorStop(1, fromNode.color + '00')

          ctx.beginPath()
          ctx.arc(flowX, flowY, 8, 0, Math.PI * 2)
          ctx.fillStyle = flowGradient
          ctx.fill()
        }
      })

      // Draw mouse interaction radius (subtle)
      if (interactive && mouse.x >= 0 && mouse.x <= 1) {
        const mx = mouse.x * width
        const my = mouse.y * height
        const radius = Math.min(width, height) * 0.15

        const mouseGradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius)
        mouseGradient.addColorStop(0, COLORS.accent + '10')
        mouseGradient.addColorStop(1, COLORS.accent + '00')

        ctx.beginPath()
        ctx.arc(mx, my, radius, 0, Math.PI * 2)
        ctx.fillStyle = mouseGradient
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Event listeners
    window.addEventListener('resize', resizeCanvas)

    // Start animation
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initNodes, connectionDensity, interactive, speed])

  // Use window-level mouse tracking for interactive mode
  useEffect(() => {
    if (!interactive) return

    const handleWindowMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    return () => window.removeEventListener('mousemove', handleWindowMouseMove)
  }, [interactive])

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {/* Gradient orbs */}
      {showOrbs && (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
      )}

      {/* Dot grid pattern */}
      {showGrid && (
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="constellation-dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="0.75" fill={COLORS.blue} opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#constellation-dots)" />
        </svg>
      )}

      {/* Canvas for animated nodes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(15, 23, 42, 0.3) 100%)',
        }}
      />
    </div>
  )
}

export default ConstellationBackground
