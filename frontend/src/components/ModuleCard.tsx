import Link from 'next/link'

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
      className="group bg-vulcan-800 hover:bg-vulcan-700 p-5 transition-colors"
    >
      <Icon className="w-5 h-5 text-vulcan-400 group-hover:text-accent transition-colors mb-3" />
      <h3 className="text-vulcan-100 font-medium text-sm mb-1">{name}</h3>
      <p className="text-vulcan-500 text-xs leading-relaxed">{description}</p>
    </Link>
  )
}
