import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  iconColor?: string
  title: string
  description: string
}

export function PageHeader({ icon: Icon, iconColor = 'text-accent', title, description }: PageHeaderProps) {
  return (
    <header className="bg-vulcan-900/80 backdrop-blur-xl border-b border-vulcan-700/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vulcan-800 border border-vulcan-600 rounded-xl flex items-center justify-center">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-vulcan-400">{description}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
