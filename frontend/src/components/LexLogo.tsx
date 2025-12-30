'use client'

interface LexLogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function LexLogo({ size = 36, className = '', animated = true }: LexLogoProps) {
  const id = Math.random().toString(36).substring(7)
  const glowId = `glow-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* L shape - vertical stroke */}
      <line x1="6" y1="5" x2="6" y2="19" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* L shape - horizontal stroke */}
      <line x1="6" y1="19" x2="18" y2="19" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Top node */}
      <circle cx="6" cy="5" r="2" fill="#cbd5e1" filter={`url(#${glowId})`}>
        {animated && <animate attributeName="r" values="2;2.3;2" dur="2.5s" repeatCount="indefinite" />}
      </circle>

      {/* Corner node */}
      <circle cx="6" cy="19" r="2" fill="#cbd5e1" filter={`url(#${glowId})`}>
        {animated && <animate attributeName="r" values="2;2.3;2" dur="2s" repeatCount="indefinite" />}
      </circle>

      {/* End node */}
      <circle cx="18" cy="19" r="2" fill="#cbd5e1" filter={`url(#${glowId})`}>
        {animated && <animate attributeName="r" values="2;2.3;2" dur="2.2s" repeatCount="indefinite" />}
      </circle>
    </svg>
  )
}

export default LexLogo
