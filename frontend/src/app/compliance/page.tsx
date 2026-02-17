'use client'

import { ComplianceChecker } from '@/components/ComplianceChecker'
import { PageHeader } from '@/components/PageHeader'
import { Shield } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={Shield}
        iconColor="text-amber-400"
        title="Compliance Checker"
        description="Policy validation against regulatory requirements"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-6">
          <ComplianceChecker />
        </div>
      </div>
    </div>
  )
}
