'use client'

import { ComplianceChecker } from '@/components/ComplianceChecker'
import { Shield } from 'lucide-react'

export default function CompliancePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Compliance</h1>
              <p className="text-sm text-slate-500">
                Policy validation against regulatory requirements
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <ComplianceChecker />
        </div>
      </div>
    </div>
  )
}
