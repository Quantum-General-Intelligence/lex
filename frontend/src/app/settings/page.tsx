'use client'

import { Settings, Database, Key, Bell, Shield, Globe, Flame } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8080')
  const [llmProvider, setLlmProvider] = useState('openai')

  return (
    <div className="min-h-screen bg-vulcan-900">
      <PageHeader
        icon={Settings}
        iconColor="text-vulcan-300"
        title="Settings"
        description="Configure your Lex instance"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-2xl space-y-6">
          <SettingsSection
            icon={Globe}
            title="API Configuration"
            description="Configure backend API connection"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-vulcan-400 mb-1.5">API Base URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-vulcan-900 border border-vulcan-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
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
                <label className="block text-xs font-medium text-vulcan-400 mb-1.5">Provider</label>
                <select
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                  className="w-full bg-vulcan-900 border border-vulcan-600 rounded-lg px-3 py-2.5 text-sm text-vulcan-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-vulcan-400 mb-1.5">API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full bg-vulcan-900 border border-vulcan-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-vulcan-500 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <p className="text-xs text-vulcan-500 mt-1.5">
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
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-vulcan-600 bg-vulcan-900 text-accent focus:ring-accent/30" />
                <span className="text-sm text-vulcan-200">Require authentication for API access</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-vulcan-600 bg-vulcan-900 text-accent focus:ring-accent/30" />
                <span className="text-sm text-vulcan-200">Enable query logging</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-vulcan-600 bg-vulcan-900 text-accent focus:ring-accent/30" />
                <span className="text-sm text-vulcan-200">Enable debug mode</span>
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
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-vulcan-600 bg-vulcan-900 text-accent focus:ring-accent/30" />
                <span className="text-sm text-vulcan-200">Email alerts for compliance issues</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-vulcan-600 bg-vulcan-900 text-accent focus:ring-accent/30" />
                <span className="text-sm text-vulcan-200">Daily digest of new regulations</span>
              </label>
            </div>
          </SettingsSection>

          <div className="flex justify-end gap-3 pt-4 border-t border-vulcan-700/50">
            <button className="px-4 py-2 text-sm text-vulcan-300 border border-vulcan-600 rounded-lg hover:bg-vulcan-800 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium">
              Save Changes
            </button>
          </div>

          {/* About section */}
          <div className="mt-8 pt-8 border-t border-vulcan-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Lex</h2>
                <p className="text-xs text-vulcan-400">Legal Intelligence Platform</p>
              </div>
            </div>
            <p className="text-xs text-vulcan-500">
              Intelligent legal cartography for mapping American laws, regulations, and court cases.
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
    <div className="bg-vulcan-800 rounded-xl border border-vulcan-700 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-vulcan-700/50 rounded-lg">
          <Icon className="w-4 h-4 text-vulcan-300" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">{title}</h2>
          <p className="text-xs text-vulcan-400">{description}</p>
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
    connected: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
    disconnected: { bg: 'bg-vulcan-700/50', text: 'text-vulcan-400', dot: 'bg-vulcan-500', border: 'border-vulcan-600' },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500', border: 'border-red-500/20' },
  }
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-vulcan-500">{details}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  )
}
