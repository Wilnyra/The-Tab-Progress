import { createContext, useState, useEffect, type ReactNode } from 'react'
import { loadSettings, saveSettings } from './settingsStorage'
import { COLOR_SCHEMES } from '../model/constants'
import type { Settings } from '../model/types'

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
    if (settings.theme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
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
