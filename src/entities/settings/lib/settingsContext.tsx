import { createContext, useState, useEffect, type ReactNode } from 'react'
import { COLOR_SCHEMES } from '../model/constants'
import type { Settings } from '../model/types'
import { loadSettings, saveSettings } from './settingsStorage'

export interface SettingsContextValue {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
)

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({
  children,
}: SettingsProviderProps): JSX.Element => {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = (updates: Partial<Settings>): void => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      saveSettings(next)
      return next
    })
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (): void => {
      let isDark: boolean

      if (settings.theme === 'system') {
        isDark = mediaQuery.matches
      } else {
        isDark = settings.theme === 'dark'
      }

      if (isDark) {
        document.body.classList.add('dark')
      } else {
        document.body.classList.remove('dark')
      }
    }

    applyTheme()

    if (settings.theme === 'system') {
      const handler = (): void => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [settings.theme])

  useEffect(() => {
    const root = document.documentElement
    const scheme = COLOR_SCHEMES[settings.colorScheme]

    root.style.setProperty('--primary', scheme.primary)
    root.style.setProperty('--accent', scheme.accent)
  }, [settings.colorScheme])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
