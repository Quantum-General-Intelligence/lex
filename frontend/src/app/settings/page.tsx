'use client'

import { Settings, Database, Key, Bell, Shield, Globe, Flame } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8080')
  const [llmProvider, setLlmProvider] = useState('openai')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-500">
                Configure your Vulcan instance
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-2xl space-y-6">
          <SettingsSection
            icon={Globe}
            title="API Configuration"
            description="Configure backend API connection"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">API Base URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Key}
            title="LLM Provider"
            description="Configure the language model for RAG queries"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Provider</label>
                <select
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Configure via environment variables in production
                </p>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Database}
            title="Database Connections"
            description="View database connection status"
          >
            <div className="space-y-2">
              <ConnectionStatus name="PostgreSQL" status="connected" details="localhost:5432" />
              <ConnectionStatus name="Neo4j" status="connected" details="localhost:7687" />
              <ConnectionStatus name="ChromaDB" status="connected" details="localhost:8000" />
              <ConnectionStatus name="Redis" status="connected" details="localhost:6379" />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Shield}
            title="Security"
            description="Security and access settings"
          >
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Require authentication for API access</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Enable query logging</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Enable debug mode</span>
              </label>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Configure alert preferences"
          >
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Email alerts for compliance issues</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">Daily digest of new regulations</span>
              </label>
            </div>
          </SettingsSection>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button className="px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Save Changes
            </button>
          </div>

          {/* About section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Vulcan</h2>
                <p className="text-xs text-slate-500">Regulatory Operating System</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Intelligent legal cartography for mapping American laws, regulations, and court cases.
              Built by Vulcan Technologies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-sm">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ConnectionStatus({
  name,
  status,
  details,
}: {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  details: string
}) {
  const statusConfig = {
    connected: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    disconnected: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    error: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  }
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{details}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  )
}
