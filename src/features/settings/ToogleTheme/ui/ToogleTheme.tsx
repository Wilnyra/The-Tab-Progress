import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useTheme } from '../lib/useTheme'
import type { Theme } from '../lib/types'

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export const ToogleTheme = (): JSX.Element => {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (newTheme: Theme): void => {
    setTheme(newTheme)
  }

  return (
    <div className="flex gap-2">
      {THEMES.map((themeOption) => {
        const isActive = theme === themeOption.value
        const Icon = themeOption.icon

        return (
          <button
            key={themeOption.value}
            type="button"
            onClick={() => handleThemeChange(themeOption.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors relative',
              isActive
                ? 'border-primary bg-accent'
                : 'border-transparent hover:border-muted-foreground/20',
            )}
            aria-label={`Select ${themeOption.label} theme`}
            aria-current={isActive ? 'true' : undefined}
          >
            {isActive && (
              <Check
                className="absolute top-1 right-1 w-3 h-3"
                aria-hidden="true"
              />
            )}
            <Icon className="w-4 h-4" />
            <span className="text-xs">{themeOption.label}</span>
          </button>
        )
      })}
    </div>
  )
}
