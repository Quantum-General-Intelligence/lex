'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-vulcan-700/50',
        className
      )}
      style={style}
    />
  )
}

// Card skeleton for loading states
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-vulcan-700/50 bg-vulcan-800/30 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

// Text block skeleton
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// Node details panel skeleton
export function NodeDetailsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <TextSkeleton lines={3} />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="bg-vulcan-900/50 rounded-lg p-3 border border-vulcan-700/50">
          <TextSkeleton lines={4} />
        </div>
      </div>

      {/* Relationships */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-vulcan-700/50">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Query result skeleton
export function QueryResultSkeleton() {
  return (
    <div className="space-y-4">
      {/* Answer */}
      <div className="p-4 rounded-xl border border-vulcan-700/50 bg-vulcan-800/30 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <TextSkeleton lines={4} />
      </div>

      {/* Citations */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border border-vulcan-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Compliance result skeleton
export function ComplianceResultSkeleton() {
  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-vulcan-700/50 bg-vulcan-800/30">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Issues */}
      {[1, 2].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-vulcan-700/50 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <TextSkeleton lines={2} />
          <div className="bg-vulcan-900/50 rounded-lg p-3">
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-vulcan-700/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Document list skeleton
export function DocumentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-vulcan-700/50">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// Graph loading skeleton
export function GraphSkeleton() {
  return (
    <div className="relative w-full h-full bg-vulcan-900 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
      {/* Fake nodes */}
      <Skeleton className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full opacity-20" />
      <Skeleton className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full opacity-20" />
      <Skeleton className="absolute bottom-1/4 left-1/3 w-14 h-14 rounded-full opacity-20" />
      <Skeleton className="absolute bottom-1/3 right-1/4 w-10 h-10 rounded-full opacity-20" />
    </div>
  )
}
