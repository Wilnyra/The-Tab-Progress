import { Sun, Moon } from 'lucide-react'
import { useSettings } from '@/entities/settings'
import { Toggle } from '@/shared/ui/Toggle'

export const ToogleTheme = (): JSX.Element => {
  const { settings, updateSettings } = useSettings()
  const isDark = settings.theme === 'dark'

  const handleChange = (pressed: boolean): void => {
    updateSettings({ theme: pressed ? 'dark' : 'light' })
  }

  return (
    <Toggle
      variant="outline"
      size="sm"
      aria-label="Toggle light theme"
      pressed={isDark}
      onPressedChange={handleChange}
    >
      {isDark ? <Sun /> : <Moon />}
    </Toggle>
  )
}
