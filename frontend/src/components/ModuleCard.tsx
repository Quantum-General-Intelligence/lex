import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ModuleCardProps {
  href: string
  icon: React.ElementType
  name: string
  description: string
}

export function ModuleCard({ href, icon: Icon, name, description }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group bg-vulcan-800/30 hover:bg-vulcan-800/50 border border-vulcan-700 hover:border-vulcan-600 rounded-xl p-6 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-vulcan-800 border border-vulcan-600 flex items-center justify-center mb-4 group-hover:border-accent/50 transition-colors">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <h3 className="text-white font-medium mb-2">{name}</h3>
      <p className="text-vulcan-400 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-1 text-accent text-sm font-medium">
        <span>Open module</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}
