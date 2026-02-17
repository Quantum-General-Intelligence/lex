'use client'

interface LexLogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function LexLogo({ size = 36, className = '' }: LexLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* L shape - vertical stroke */}
      <line x1="6" y1="5" x2="6" y2="19" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
      {/* L shape - horizontal stroke */}
      <line x1="6" y1="19" x2="18" y2="19" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />

      {/* Top node */}
      <circle cx="6" cy="5" r="2.5" fill="#6366f1" />
      {/* Corner node */}
      <circle cx="6" cy="19" r="2.5" fill="#6366f1" />
      {/* End node */}
      <circle cx="18" cy="19" r="2.5" fill="#6366f1" />
    </svg>
  )
}

export default LexLogo
