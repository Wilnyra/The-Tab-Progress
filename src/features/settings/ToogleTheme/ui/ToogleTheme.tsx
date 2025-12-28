import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useSettings } from '@/entities/settings'
import type { Theme } from '@/entities/settings'
import { cn } from '@/shared/lib/cn'

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export const ToogleTheme = (): JSX.Element => {
  const { settings, updateSettings } = useSettings()

  const handleThemeChange = (theme: Theme): void => {
    updateSettings({ theme })
  }

  return (
    <div className="flex gap-2">
      {THEMES.map((theme) => {
        const isActive = settings.theme === theme.value
        const Icon = theme.icon

        return (
          <button
            key={theme.value}
            type="button"
            onClick={() => handleThemeChange(theme.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors relative',
              isActive
                ? 'border-primary bg-accent'
                : 'border-transparent hover:border-muted-foreground/20'
            )}
            aria-label={`Select ${theme.label} theme`}
            aria-current={isActive ? 'true' : undefined}
          >
            {isActive && (
              <Check className="absolute top-1 right-1 w-3 h-3" aria-hidden="true" />
            )}
            <Icon className="w-4 h-4" />
            <span className="text-xs">{theme.label}</span>
          </button>
        )
      })}
    </div>
  )
}
