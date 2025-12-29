import { useSearchParams } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface SettingsSidebarProps {
  activeSection: string
}

export const SettingsSidebar = ({
  activeSection,
}: SettingsSidebarProps): JSX.Element => {
  const [, setSearchParams] = useSearchParams()

  const handleSectionChange = (section: string): void => {
    setSearchParams({ section }, { replace: true })
  }

  const navItems = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'account', label: 'Account' },
  ]

  return (
    <nav className="w-full md:w-64 border-r border-border pr-6">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <li key={item.id}>
              <button
                onClick={() => {
                  handleSectionChange(item.id)
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
