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
    <nav
      aria-label="Settings sections"
      className="w-full md:w-64 md:border-r md:border-border md:pr-6"
    >
      <ul className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 md:block md:space-y-1 md:rounded-none md:bg-transparent md:p-0">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  handleSectionChange(item.id)
                }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full min-h-11 text-center px-3 py-2 rounded-md text-sm transition-colors sm:min-h-0 md:text-left',
                  isActive
                    ? 'bg-background text-foreground font-medium shadow-sm md:bg-accent md:text-accent-foreground md:shadow-none'
                    : 'text-muted-foreground hover:text-foreground md:hover:bg-accent/50',
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
